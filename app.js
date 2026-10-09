const express = require("express");
const app = express();

const port = process.env.PORT || 3000;
const version = process.env.APP_VERSION || "local";

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hybrid CI/CD Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .dashboard {
      width: 100%;
      max-width: 760px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 20px;
      padding: 32px;
    }
    h1 { margin-top: 0; }
    .subtitle { color: #94a3b8; }
    .status { color: #4ade80; font-weight: bold; }
    .cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 28px 0;
    }
    .card {
      background: #0f172a;
      border-radius: 14px;
      padding: 24px;
    }
    .label { color: #94a3b8; font-size: 14px; }
    .number {
      font-size: 48px;
      font-weight: bold;
      margin-top: 12px;
      color: #38bdf8;
    }
    .info {
      border-top: 1px solid #334155;
      padding: 14px 0;
    }
    @media (max-width: 480px) {
      .cards { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <h1>🚀 Hybrid CI/CD Dashboard</h1>
    <p class="subtitle">
      GitHub → Jenkins → Amazon ECR → Kubernetes
    </p>

    <p class="status">● Application Running</p>

    <div class="cards">
      <div class="card">
        <div class="label">Current Build</div>
        <div class="number">#${version}</div>
      </div>

      <div class="card">
        <div class="label">Jenkins Build Number</div>
        <div class="number">${version}</div>
      </div>
    </div>

    <div class="info">Registry: Amazon ECR</div>
    <div class="info">Platform: Kubernetes on VMware</div>
    <div class="info">Application Port: 3000</div>
    <div class="info">NodePort: 30081</div>
  </div>
</body>
</html>
  `);
});

app.listen(port, () => {
  console.log(`Dashboard version ${version} running on port ${port}`);
});
