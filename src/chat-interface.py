import requests 
import json

NGROK_URL = "https://jack-unvanquished-marlyn.ngrok-free.dev"

def chat_interface():
    print("=== Shoplite Chat Interface ===")
    print("Type 'exit' to quit.")
    print("Special commands:")
    print("  /clarify <question> → force clarification prompt")
    print("  /refuse <question>  → force refusal prompt\n")

    conversation = []

    while True:
        query = input("> ").strip()
        if query.lower() in ["exit", "quit"]:
            break

        # Decide prompt_key based on special commands
        if query.startswith("/clarify"):
            payload = {
                "query": query.replace("/clarify", "").strip(),
                "prompt_key": "clarification_prompt"
            }
        elif query.startswith("/refuse"):
            payload = {
                "query": query.replace("/refuse", "").strip(),
                "prompt_key": "refusal_prompt"
            }
        else:
            # Default: backend auto-selects base or multi-doc
            payload = {"query": query}

        try:
            response = requests.post(f"{NGROK_URL}/chat", json=payload)

            if response.status_code == 200:
                data = response.json()
                answer = data.get("answer", "")

                # --- Display full model output (Answer + Sources) ---
                print(answer + "\n")

                answer_text = ""
                sources_text = ""

                if "Sources:" in answer:
                    parts = answer.split("Sources:")
                    answer_text = parts[0].replace("Answer:", "").strip()
                    sources_text = parts[1].strip()
                else:
                    answer_text = answer.strip()
                    sources_text = "None"

                # Save to conversation log
                conversation.append({
                    "query": query,
                    "answer": answer_text,
                    "sources": sources_text
                })

            else:
                print("Error:", response.text)

        except Exception as e:
            print("Error connecting to server:", str(e))

    # Save conversation log to file
    with open("conversation_log.json", "w") as f:
        json.dump(conversation, f, indent=2)

    print("\nConversation saved to conversation_log.json")

if __name__ == "__main__":
    chat_interface()
