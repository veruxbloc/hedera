import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: "Backend API endpoint mock. Listo para integrarse con bases de datos o contratos inteligentes." 
  });
}
