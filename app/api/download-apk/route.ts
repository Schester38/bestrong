import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const apkPath = path.join(process.cwd(), 'public', 'apk', 'BeStrong.apk');
    
    // Vérifier si le fichier existe
    try {
      await fs.access(apkPath);
    } catch {
      return NextResponse.json({ error: 'APK non trouvé' }, { status: 404 });
    }

    // Lire les stats du fichier
    const stats = await fs.stat(apkPath);
    const fileSize = stats.size;

    // Récupérer les headers de la requête
    const range = request.headers.get('range');
    
    if (range) {
      // Support des téléchargements résumables
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const file = await fs.readFile(apkPath);
      const chunk = file.slice(start, end + 1);

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="BeStrong.apk"',
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD',
        'Access-Control-Allow-Headers': 'Range',
      };

      return new NextResponse(chunk, {
        status: 206,
        headers,
      });
    } else {
      // Téléchargement complet
      const file = await fs.readFile(apkPath);
      
      const headers = {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="BeStrong.apk"',
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD',
        'Access-Control-Allow-Headers': 'Range',
      };

      return new NextResponse(file, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement APK:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const apkPath = path.join(process.cwd(), 'public', 'apk', 'BeStrong.apk');
    
    try {
      await fs.access(apkPath);
    } catch {
      return NextResponse.json({ error: 'APK non trouvé' }, { status: 404 });
    }

    const stats = await fs.stat(apkPath);
    
    const headers = {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="BeStrong.apk"',
      'Content-Length': stats.size.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD',
      'Access-Control-Allow-Headers': 'Range',
    };

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Erreur lors de la requête HEAD APK:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la requête HEAD' },
      { status: 500 }
    );
  }
} 