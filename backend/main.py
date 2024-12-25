from fastapi import FastAPI, File, UploadFile, HTTPException
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Model = tf.keras.models.load_model("./models/29.keras")
Class_Name = ['Bệnh cháy bìa lá', 'Bệnh đạo ôn', 'Bệnh đốm nâu', 'Khỏe mạnh']

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):  
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    image = read_file_as_image(await file.read())  
    img = np.expand_dims(image, 0)
    prediction = Model.predict(img)
    predicted_class = Class_Name[np.argmax(prediction[0])]
    confidence = np.max(prediction[0])
    
    return {
        'class': predicted_class,
        'confidence': float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
