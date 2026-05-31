FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python generate_previews.py

EXPOSE 8000

CMD ["sh", "-c", "python init_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
