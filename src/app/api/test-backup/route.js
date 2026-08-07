import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

export async function GET(request) {
  const apiKey = request.headers.get('x-internal-api-key');
  const validKey = process.env.INTERNAL_API_KEY;

  if (!validKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized: Internal API Key Required' }, { status: 401 });
  }

  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'backup-db.js');
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`);
    
    return NextResponse.json({
      success: true,
      message: 'Backup test execution completed.',
      stdout,
      stderr
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Backup test failed',
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    }, { status: 500 });
  }
}
