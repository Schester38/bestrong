import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('=== SUPPRESSION NOTIFICATION SYSTÈME ===')
    console.log('ID reçu:', id)
    console.log('URL:', request.url)

    // Vérifier d'abord si la notification existe
    const { data: existingNotification, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', id)
      .single()

    console.log('Vérification existence:', { existingNotification, checkError })

    if (checkError) {
      console.error('Erreur vérification notification système:', checkError)
      return NextResponse.json(
        { error: 'Notification non trouvée', details: checkError },
        { status: 404 }
      )
    }

    if (!existingNotification) {
      console.log('Notification système non trouvée:', id)
      return NextResponse.json(
        { error: 'Notification non trouvée', id },
        { status: 404 }
      )
    }

    // Supprimer la notification de la base de données
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    console.log('Résultat suppression:', { error })

    if (error) {
      console.error('Erreur suppression notification système:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression', details: error },
        { status: 500 }
      )
    }

    console.log('Notification système supprimée avec succès:', id)
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error },
      { status: 500 }
    )
  }
} 