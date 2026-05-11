import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { shareServices } from "../../services/shareServices";

/**
 * onImageUploaded: callback({ url, public_id }) — để page cha track ảnh đã upload
 */
function TinnyMce({ value, onChange, onImageUploaded }) {
  const handleImageUpload = async (blobInfo) => {
    const formData = new FormData();
    formData.append("files", blobInfo.blob(), blobInfo.filename());

    const res = await shareServices.postUploadImage(formData);
    const uploaded = res?.data?.[0];
    if (!uploaded?.url) throw new Error("Upload ảnh thất bại");

    // Báo cho page cha biết có ảnh mới được upload
    onImageUploaded?.(uploaded);
    return uploaded.url;
  };

  return (
    <Editor
      // apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
      tinymceScriptSrc="/js/tinymce/tinymce.min.js"
      value={value}
      onEditorChange={onChange}
      
      init={{
        height: "100vh",
        license_key: 'gpl',
        plugins:
          "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",

        toolbar:
          "undo redo | blocks | bold italic underline | link image media | align | bullist numlist | removeformat",

        automatic_uploads: true,
        images_upload_handler: async (blobInfo) => {
          const url = await handleImageUpload(blobInfo);
          return url;
        },
      }}
    />
  );
}

export default TinnyMce;