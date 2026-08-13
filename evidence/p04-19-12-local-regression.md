
# EXECUTIVE VERDICT
FINAL: FAIL

# LOCAL REGRESSION RESULTS (PRISMA DIRECT INVOCATION)
- **Query:** "radio" | **Status:** 200 | **Latency:** 53ms | **Fuses:** 0 | **Faults:** 0 \n- **Query:** "fuel pump" | **Status:** 500 | **Latency:** 4ms | **Fuses:** 0 | **Faults:** 0 | **Error:** 
Invalid `prisma.fuse.findMany()` invocation in
C:\Users\xbors\OneDrive\Desktop\Bursali_Oto_Dijital_Yonetim\Web_Sitesi\bursali-oto-web\scripts\test_prisma_direct.cjs:20:45

  17 const formattedQuery = q.trim().split(/\\s+/).join(' | ');
  18 
  19 try {
→ 20     const fuses = await prisma.fuse.findMany(
Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "42601", message: "syntax error in tsquery: \"fuel pump\"", severity: "ERROR", detail: None, column: None, hint: None }), transient: false })\n- **Query:** "pump relay" | **Status:** 500 | **Latency:** 2ms | **Fuses:** 0 | **Faults:** 0 | **Error:** 
Invalid `prisma.fuse.findMany()` invocation in
C:\Users\xbors\OneDrive\Desktop\Bursali_Oto_Dijital_Yonetim\Web_Sitesi\bursali-oto-web\scripts\test_prisma_direct.cjs:20:45

  17 const formattedQuery = q.trim().split(/\\s+/).join(' | ');
  18 
  19 try {
→ 20     const fuses = await prisma.fuse.findMany(
Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "42601", message: "syntax error in tsquery: \"pump relay\"", severity: "ERROR", detail: None, column: None, hint: None }), transient: false })\n- **Query:** "zzzz_nonexistent_123456" | **Status:** 200 | **Latency:** 2ms | **Fuses:** 0 | **Faults:** 0 \n- **Query:** "radyo" | **Status:** 200 | **Latency:** 3ms | **Fuses:** 0 | **Faults:** 0 \n- **Query:** "fren" | **Status:** 200 | **Latency:** 5ms | **Fuses:** 0 | **Faults:** 0 \n- **Query:** "silecek" | **Status:** 200 | **Latency:** 3ms | **Fuses:** 0 | **Faults:** 0 \n- **Query:** "yakıt" | **Status:** 200 | **Latency:** 2ms | **Fuses:** 0 | **Faults:** 2 \n- **Query:** "pompa" | **Status:** 200 | **Latency:** 3ms | **Fuses:** 0 | **Faults:** 0 

# ANALYSIS
- Status 200 indicates the Prisma code executes correctly without throwing exceptions.
- The results confirm if full-text search syntax (`@@`) is valid in this local PostgreSQL environment.
    