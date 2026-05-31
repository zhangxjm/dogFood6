FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY package.json package-lock.json /app/
RUN npm install

COPY . /app/

RUN npm run build

EXPOSE 8000

CMD ["sh", "-c", "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"]
