import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const COMFYUI_URL = process.env.COMFYUI_URL || "http://14.248.85.158:9042";
const WORKFLOW_PATH = path.join(__dirname, "../../workflow/change_cloth.json");
const PERSON_NODE_ID = "83";
const CLOTH_NODE_ID = "727";

async function uploadImageToComfy(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  const form = new FormData();
  form.append("image", fileBuffer, { filename });

  const response = await axios.post(`${COMFYUI_URL}/upload/image`, form, {
    headers: form.getHeaders(),
  });

  return response.data.name;
}

async function queuePrompt(prompt: Record<string, unknown>): Promise<string> {
  const data = {
    prompt,
    client_id: uuidv4(),
  };

  const response = await axios.post(`${COMFYUI_URL}/prompt`, data);
  return response.data.prompt_id;
}

async function waitForCompletion(
  promptId: string,
  timeout = 300
): Promise<string> {
  const start = Date.now();

  while (true) {
    const { data: history } = await axios.get(
      `${COMFYUI_URL}/history/${promptId}`
    );

    if (history[promptId]) {
      const outputs = history[promptId].outputs || {};

      for (const nodeId of Object.keys(outputs)) {
        const nodeOutput = outputs[nodeId];

        if (nodeOutput.images && nodeOutput.images.length > 0) {
          const image = nodeOutput.images[0];
          const imageUrl = `${COMFYUI_URL}/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
          return imageUrl;
        }
      }
    }

    if ((Date.now() - start) / 1000 > timeout) {
      throw new Error("Generation timeout");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export const changeClothUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const personFile = req.file;
    const clothUrl = req.body.cloth_url as string;

    if (!personFile || !clothUrl) {
      res.status(400).json({ detail: "Missing person file or cloth_url" });
      return;
    }

    // Download cloth image từ Cloudinary URL
    const clothResponse = await axios.get(clothUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    const clothBuffer = Buffer.from(clothResponse.data);

    // Upload cả 2 ảnh lên ComfyUI
    const personName = await uploadImageToComfy(
      personFile.buffer,
      personFile.originalname
    );
    const clothName = await uploadImageToComfy(
      clothBuffer,
      `cloth_${uuidv4()}.jpg`
    );

    // Load workflow
    const workflowRaw = fs.readFileSync(WORKFLOW_PATH, "utf-8");
    const workflow = JSON.parse(workflowRaw);

    // Set input images
    workflow[PERSON_NODE_ID].inputs.image = personName;
    workflow[CLOTH_NODE_ID].inputs.image = clothName;

    // Submit và chờ kết quả
    const promptId = await queuePrompt(workflow);
    const outputImageUrl = await waitForCompletion(promptId);

    res.json({
      success: true,
      output_image: outputImageUrl,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ detail: message });
  }
};

export const proxyImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      res.status(400).json({ detail: "Missing url parameter" });
      return;
    }

    const response = await axios.get(imageUrl, {
      responseType: "stream",
      timeout: 30000,
    });

    res.setHeader("Content-Type", "image/png");
    response.data.pipe(res);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Cannot fetch image";
    res.status(400).json({ detail: message });
  }
};
