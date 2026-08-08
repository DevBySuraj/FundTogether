# Custom Workspace Instructions — FundTogether

## ⚖ Dual Environment Policy (Local & Production Compatibility)

1. **MongoDB Atlas for All Environments (Local & Production)**:
   - **Recommended & Primary Standard**: Discard local MongoDB instances (`127.0.0.1:27017`). Use **MongoDB Atlas** (`mongodb+srv://...`) for BOTH local development and cloud production.
   - **Benefits**: Guarantees 100% data consistency, eliminates local MongoDB background process issues, and ensures demo data created locally is immediately visible on live production apps and vice versa.
2. **Prioritize Dual-Compatibility Fixes**: If any step, dependency, or code change introduces friction, breaking behavior, or environment mismatch between Local and Production, THAT ISSUE MUST BE SOLVED FIRST before any new features are added.
3. **Environment-Agnostic Configuration**:
   - **Frontend**: Use `import.meta.env.VITE_API_BASE_URL` with automatic local fallback (`http://localhost:5000`).
   - **Backend**: Bind HTTP server to `0.0.0.0` on `process.env.PORT || 5000`. Use wildcard / dynamic CORS (`cors({ origin: '*' })`) to allow local and cloud origins.
   - **Database**: Connect to `process.env.MONGODB_URI` (MongoDB Atlas Cloud Cluster) across all local and cloud environments.
   - **Web3 / MetaMask**: Read chainId locally via `window.ethereum` and use resilient multi-RPC fallback arrays (Ankr, dRPC, Official) to eliminate rate limits in both local and production environments.
