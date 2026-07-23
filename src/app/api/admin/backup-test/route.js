import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'backup-db.js');
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`);
    
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
