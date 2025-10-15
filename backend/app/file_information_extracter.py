import os
import shutil
import pytesseract
import dotenv
dotenv.load_dotenv()

pytesseract.pytesseract.tesseract_cmd = os.environ.get('TESSERACT')
from PIL import Image
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb
import fitz
import app.schemas as schemas
from datetime import datetime

client = chromadb.PersistentClient("./chromadb")
text_collection = client.get_or_create_collection("docs-text")
image_collection = client.get_or_create_collection("docs-images")
# models for vectorization
text_model = SentenceTransformer("all-MiniLM-L6-v2")
image_model = SentenceTransformer("clip-ViT-B-32")

UPLOAD_ROUTE = "./uploads"

def get_user_folder(user_id: int):
    user_folder = os.path.join(UPLOAD_ROUTE, f"user_{user_id}")
    os.makedirs(user_folder, exist_ok=True)
    pdf_folder = os.path.join(user_folder, "pdfs")
    os.makedirs(pdf_folder, exist_ok=True)
    image_folder = os.path.join(user_folder, "images")
    os.makedirs(image_folder, exist_ok=True)
    return user_folder, image_folder, pdf_folder

def file_uploader(file, notebook_id: int, user_id: int, db):
    # Make folders if not exists
    user_folder, image_folder, pdf_folder = get_user_folder(user_id)
    pdf_path = os.path.join(pdf_folder, file.filename)

    existing_file = db.query(schemas.Files).filter_by(
    file_name=file.filename,
    notebook_id=notebook_id,
    user_id=user_id
    ).first()
    if existing_file:
        return {"message": "File already uploaded", "pdf_path": existing_file.file_path}
    # Save PDF
    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Calculate file size
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    # Save PDF reference in database
    db_file = schemas.Files(
        file_name=file.filename,
        file_path=pdf_path,
        notebook_id=notebook_id,
        user_id=user_id,
        size=size,
        file_type=file.content_type,
        uploaded_at=datetime.now()
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Extract printed text
    doc = fitz.open(pdf_path)
    printed_texts = [page.get_text() for page in doc]

    # Extract handwritten text + images
    handwritten_texts = []
    extracted_images = []

    for page_num, page in enumerate(doc):
        # Render page to image
        pix = page.get_pixmap()
        image_filename = f"{file.filename}_page{page_num}_img.png"
        img_path = os.path.join(image_folder, image_filename)
        pix.save(img_path)

        # OCR for handwritten/scanned text
        img = Image.open(img_path)
        text = pytesseract.image_to_string(img)
        handwritten_texts.append(text)

        extracted_images.append({
            "image": img,
            "file_name": image_filename,
            "file_path": img_path,
            "page": page_num,
            "modality": "image"
        })

    # Divide texts into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    all_texts = printed_texts + handwritten_texts
    text_chunks = splitter.split_text(" ".join(all_texts))

    # Vectorize text
    text_embeddings = text_model.encode(text_chunks)

    # Vectorize images
    image_embeddings = image_model.encode([img['image'] for img in extracted_images])

    # Store text in ChromaDB
    text_collection.add(
        documents=text_chunks,
        embeddings=text_embeddings.tolist(),
        ids=[f"{db_file.file_id}_text_{i}" for i in range(len(text_chunks))],
        metadatas=[{"user_id": user_id, "modality": "text", "notebook_id": notebook_id, "file_id": db_file.file_id} for _ in text_chunks]
    )

    # Store images in ChromaDB
    image_collection.add(
        documents=[img['file_name'] for img in extracted_images],
        embeddings=image_embeddings.tolist(),
        ids=[f"{db_file.file_id}_img_{i}" for i in range(len(extracted_images))],
        metadatas=[{
            "user_id": user_id,
            "notebook_id": notebook_id,
            "modality": "image",
            "file_id": db_file.file_id,
            "file_path": img['file_path'],
            "page": img['page']
        } for img in extracted_images]
    )

    return {"message": "PDF processed and stored successfully", "pdf_path": pdf_path}
