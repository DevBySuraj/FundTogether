# Custom Workspace Instructions — FundTogether

## ⚖ Dual Environment Policy (Local & Production Compatibility)

1. **MongoDB Atlas Cloud ONLY (Strict Rule)**:
   - **Local Fallback Disabled**: Local MongoDB instance fallback (`127.0.0.1:27017`) is COMPLETELY REMOVED.
   - **Single Cloud Database**: Both local backend development and cloud production MUST connect strictly to **MongoDB Atlas Cloud** (`mongodb+srv://...`).
   - **Benefits**: Ensures 100% data consistency across local development, testing, and production deployments.
2. **Prioritize Dual-Compatibility Fixes**: If any step, dependency, or code change introduces friction, breaking behavior, or environment mismatch between Local and Production, THAT ISSUE MUST BE SOLVED FIRST before any new features are added.
3. **Environment-Agnostic Configuration**:
   - **Frontend**: Use `import.meta.env.VITE_API_BASE_URL` with automatic local fallback (`http://localhost:5000`).
   - **Backend**: Bind HTTP server to `0.0.0.0` on `process.env.PORT || 5000`. Use wildcard / dynamic CORS (`cors({ origin: '*' })`) to allow local and cloud origins.
   - **Database**: Connect strictly to `process.env.MONGODB_URI` (MongoDB Atlas Cloud Cluster).
   - **Web3 / MetaMask**: Read chainId locally via `window.ethereum` and use resilient multi-RPC fallback arrays (Ankr, dRPC, Official) to eliminate rate limits in both local and production environments.
