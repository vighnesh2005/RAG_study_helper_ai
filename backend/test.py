from sentence_transformers import SentenceTransformer
import chromadb

# ✅ Load model once and reuse
# If you have a GPU, set device="cuda" for speed
text_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")

# ✅ Connect once (avoid re-opening every query)
client = chromadb.PersistentClient(path="./chromadb")
text_collection = client.get_or_create_collection("docs-text")

def search_file(query: str, user_id: int, notebook_id: int, file_id: int, top_k: int = 1):
    # ✅ Precompute embedding (batched)
    query_embedding = text_model.encode([query], convert_to_numpy=True).tolist()

    # ✅ Query Chroma with filters
    results = text_collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        where={
            "$and": [
                {"user_id": {"$eq": user_id}},
                {"notebook_id": {"$eq": notebook_id}},
                {"file_id": {"$eq": file_id}}
            ]
        }
    )

    return results


# 🚀 Example usage
if __name__ == "__main__":
    query = "Who is Vighnesh Prasad"
    results = search_file(query, user_id=1, notebook_id=1, file_id=1, top_k=1)

    print("=== Query Results ===")
    print(results)
    print("=====================")
