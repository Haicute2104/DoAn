import json, shutil, uuid, time, requests
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Change Cloth API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COMFYUI_URL = "http://192.168.1.23:8188"
WORKFLOW_PATH = "change_cloth.json"
PERSON_NODE_ID = "76"
CLOTH_NODE_ID = "81"


def upload_image_to_comfy(file_path: Path):
    with open(file_path, "rb") as f:
        files = {"image": f}

        response = requests.post(
            f"{COMFYUI_URL}/upload/image",
            files=files
        )

    if response.status_code != 200:
        raise Exception("Upload image failed")

    return response.json()["name"]


def queue_prompt(prompt):
    data = {
        "prompt": prompt,
        "client_id": str(uuid.uuid4())
    }

    response = requests.post(
        f"{COMFYUI_URL}/prompt",
        json=data
    )

    if response.status_code != 200:
        raise Exception("Queue prompt failed")

    return response.json()["prompt_id"]


def get_history(prompt_id):
    response = requests.get(
        f"{COMFYUI_URL}/history/{prompt_id}"
    )

    return response.json()


def wait_for_completion(prompt_id, timeout=300):
    start = time.time()

    while True:
        history = get_history(prompt_id)

        if prompt_id in history:
            outputs = history[prompt_id].get("outputs", {})

            for node_id in outputs:
                node_output = outputs[node_id]

                if "images" in node_output:
                    image = node_output["images"][0]

                    filename = image["filename"]
                    subfolder = image["subfolder"]
                    image_type = image["type"]

                    image_url = (
                        f"{COMFYUI_URL}/view?"
                        f"filename={filename}"
                        f"&subfolder={subfolder}"
                        f"&type={image_type}"
                    )

                    return image_url

        if time.time() - start > timeout:
            raise Exception("Generation timeout")

        time.sleep(1)


@app.post("/change-cloth")
async def change_cloth(
    person: UploadFile = File(...),
    cloth: UploadFile = File(...)
):
    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)

    person_path = temp_dir / person.filename
    cloth_path = temp_dir / cloth.filename

    with open(person_path, "wb") as f:
        shutil.copyfileobj(person.file, f)

    with open(cloth_path, "wb") as f:
        shutil.copyfileobj(cloth.file, f)

    try:
        # upload lên ComfyUI
        person_name = upload_image_to_comfy(person_path)
        cloth_name = upload_image_to_comfy(cloth_path)

        # load workflow
        with open(WORKFLOW_PATH, "r", encoding="utf-8") as f:
            workflow = json.load(f)

        # thay input image
        workflow[PERSON_NODE_ID]["inputs"]["image"] = person_name
        workflow[CLOTH_NODE_ID]["inputs"]["image"] = cloth_name

        # submit workflow
        prompt_id = queue_prompt(workflow)

        # chờ generate xong
        output_image_url = wait_for_completion(prompt_id)

        return {
            "success": True,
            "output_image": output_image_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if person_path.exists():
            person_path.unlink()

        if cloth_path.exists():
            cloth_path.unlink()


@app.get("/")
def root():
    return {
        "message": "Change Cloth API Running"
    }
