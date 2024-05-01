from fastapi import FastAPI
from pydantic import BaseModel
import json
from joblib import load

app = FastAPI()
model = load("models/random_forest_model.joblib")
vectorizer = load("models/tfidf_vectorizer.joblib")


def predict(input_text):
    input_vector = vectorizer.transform([input_text])
    predictions = model.predict(input_vector)
    return json.dumps(predictions.tolist())


@app.get("/py-api/hello")
def hello_world():
    return {"message": "Hello World"}


class Data(BaseModel):
    text: str


@app.post("/py-api/predict")
def hello_world(data: Data):
    prediction = predict(data.text)
    return {"prediction": prediction}
