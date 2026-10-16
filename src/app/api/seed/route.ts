import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify, estimateReadMinutes } from '@/lib/format'

const SEED_ARTICLES = [
  {
    title: 'TP Mazembe s\'impose 3-1 face à Lupopo dans le derby de Lubumbashi',
    excerpt:
      'Les Corbeaux ont dominé le derby haut-katangais grâce à un doublé de leur attaquant vedette. Une victoire qui propulse Mazembe à la deuxième place du classement.',
    content:
      'Ce samedi au stade TP Mazembe, les Corbeaux ont offert un spectacle de qualité à leurs supporters lors du derby face à Lupopo. Dès la 12e minute, l\'attaquant vedette ouvrait le score d\'une frappe enroulée du gauche.\n\nLa réaction de Lupopo fut immédiate, mais le gardien de Mazembe s\'illustrait par deux arrêts décisifs. À la 38e, sur un centre venu de la droite, le numéro 9 doublait la mise de la tête.\n\nEn seconde période, Lupopo réduisait l\'écart sur penalty, mais Mazembe scellait le score en fin de match (3-1). Cette victoire permet aux Corbeaux de revenir à un point du leader.\n\n« On a joué avec discipline et cœur. C\'est une victoire pour nos supporters », a déclaré l\'entraîneur en conférence de presse.',
    scope: 'PROVINCIAL' as const,
    sport: 'FOOTBALL' as const,
    location: 'Lubumbashi, Haut-Katanga',
    source: 'Goal Zone TV — Lubumbashi',
    imageUrl: '/articles/hero-football.png',
    imageAlt: 'Match TP Mazembe à Lubumbashi',
    featured: true,
    breaking: true,
  },
  {
    title: 'LINAFOOT : calendrier complet de la 12e journée dévoilé',
    excerpt:
      'La Linafoot a publié le calendrier officiel de la 12e journée. Six matchs au programme ce week-end, avec plusieurs affiches au sommet.',
    content:
      'La Ligue Nationale de Football (LINAFOOT) a communiqué ce vendredi le calendrier détaillé de la 12e journée du championnat national.\n\nLes rencontres se tiendront dans cinq stades différents à travers le pays : Kinshasa, Lubumbashi, Mbuji-Mayi, Kananga et Goma.\n\nL\'affiche principale opposera les deux leaders du classement, tandis que la lutte pour le maintien s\'annonce féroce en bas de tableau.\n\nLes supporters sont invités à se procurer leurs billets dans les points de vente officiels.',
    scope: 'NATIONAL' as const,
    sport: 'FOOTBALL' as const,
    location: 'Kinshasa',
    source: 'LINAFOOT',
    imageUrl: '/articles/national-leopards.png',
    imageAlt: 'LINAFOOT calendrier',
    featured: true,
    breaking: false,
  },
  {
    title: 'CAF Champions League : les Léopards congolais visent le titre',
    excerpt:
      'Trois clubs congolais engagés dans la plus prestigieuse compétition de clubs africains. Tour d\'horizon des ambitions et du calendrier.',
    content:
      'La CAF Champions League reprend ses droits ce week-end avec une représentation congolaise ambitieuse. Trois clubs du pays sont engagés dans la course au titre continental.\n\nLes TP Mazembe, champions en titre de la RDC, abordent cette édition avec un effectif renforcé. Les Tanganyika et Don Bosco complètent le trio congolais.\n\nLe tirage au sort des groupes aura lieu au Caire la semaine prochaine. Les supporters espèrent un groupe abordable pour nos représentants.\n\n« L\'Afrique est notre objectif cette saison », a confié un dirigeant de club.',
    scope: 'INTERNATIONAL' as const,
    sport: 'FOOTBALL' as const,
    location: 'Le Caire, Égypte',
    source: 'CAF',
    imageUrl: '/articles/international-cls.png',
    imageAlt: 'CAF Champions League',
    breaking: false,
  },
  {
    title: 'Basketball : la sélection nationale prépare les éliminatoires',
    excerpt:
      'Les Léopards basket préparent leurs éliminatoires de la Coupe d\'Afrique. Stage intensif à Kinshasa avec 16 joueurs présélectionnés.',
    content:
      'L\'équipe nationale de basketball poursuit son stage de préparation à Kinshasa en vue des éliminatoires de la Coupe d\'Afrique des Nations (Afrobasket).\n\nLe sélectionneur a retenu 16 joueurs, dont plusieurs évoluant dans des championnats étrangers (France, Espagne, Maroc).\n\nLes séances se succèdent matin et après-midi au Palais des Sports de Mashini. Le premier match qualificatif est prévu dans deux semaines face à l\'Angola.\n\n« On construit un groupe compétitif », souligne le coach.',
    scope: 'NATIONAL' as const,
    sport: 'BASKETBALL' as const,
    location: 'Kinshasa',
    imageUrl: '/articles/basketball.png',
    imageAlt: 'Match de basketball',
    breaking: false,
  },
  {
    title: 'Boxe : Ilunga Kalaba décroche la ceinture panafricaine',
    excerpt:
      'Le boxeur congolais s\'impose par KO au 8e round et devient champion panafricain des poids moyens. Une consécration pour le sport congolais.',
    content:
      'Sous les applaudissements d\'un public conquis, Ilunga Kalaba a remporté ce soir la ceinture panafricaine des poids moyens en s\'imposant par KO technique au 8e round face au tenant camerounais.\n\nLe combat, organisé à Lubumbashi, a tenu toutes ses promesses. Après un début de match à l\'avantage du Camerounais, le Congolais a su inverser la tendance grâce à un crochet du droit plein cadran.\n\n« Je dédie ce titre à tout le peuple congolais et à ma ville de Lubumbashi », a lancé Kalaba, le poing levé.\n\nLe nouveau champion défendra sa ceinture dans trois mois.',
    scope: 'NATIONAL' as const,
    sport: 'BOXE' as const,
    location: 'Lubumbashi',
    imageUrl: '/articles/boxe.png',
    imageAlt: 'Combat de boxe',
    breaking: true,
  },
  {
    title: 'Mercato : trois recrues annoncées au mercato congolais',
    excerpt:
      'Le mercato d\'hiver s\'anime en RDC. Trois transferts officiels confirmés, dont un retour d\'Europe pour le club de Don Bosco.',
    content:
      'Le mercato congolais s\'emballe avec l\'officialisation de trois transferts majeurs cette semaine.\n\nDon Bosco réalise le coup du mercato en rapatriant un joueur évoluant en deuxième division belge. Le contrat porte sur deux saisons.\n\nDeux autres clubs ont confirmé des arrivées en provenance du championnat zambien et de la Ligue tanzanienne.\n\nLa fenêtre de transferts reste ouverte encore dix jours.',
    scope: 'NATIONAL' as const,
    sport: 'FOOTBALL' as const,
    location: 'Lubumbashi',
    breaking: false,
  },
  {
    title: 'Athlétisme : records tombent aux championnats provinciaux',
    excerpt:
      'Les championnats provinciaux d\'athlétisme du Haut-Katanga ont livré plusieurs performances de haut niveau. Trois records battus en sprint et demi-fond.',
    content:
      'Le stade Mwepu Ilunga a vibré ce week-end pour les championnats provinciaux d\'athlétisme du Haut-Katanga. Trois records provinciaux ont été battus.\n\nSur 100m, le jeune sprinter de l\'Académie Lubumbashi a couru en 10,34s. Sur 800m, une athlète féminine a effacé une marque vieille de douze ans.\n\nEn saut en longueur, la barre des 7,80m a été franchie pour la première fois depuis cinq ans.\n\nLes meilleurs athlètes représenteront la province aux championnats nationaux le mois prochain.',
    scope: 'PROVINCIAL' as const,
    sport: 'ATHLETISME' as const,
    location: 'Lubumbashi',
    breaking: false,
  },
  {
    title: 'CHAN 2025 : la RDC dans le groupe A avec le Maroc',
    excerpt:
      'Le tirage du CHAN 2025 a placé les Léopards locaux dans un groupe relevé. Tour d\'horizon des adversaires et des enjeux.',
    content:
      'Le tirage au sort du Championnat d\'Afrique des Nations (CHAN) 2025 a placé la République Démocratique du Congo dans le groupe A, aux côtés du Maroc, pays organisateur, ainsi que du Sénégal et du Mozambique.\n\nLe CHAN, réservé aux joueurs évoluant dans leur championnat national, est une compétition majeure pour le football continental.\n\nLes Léopards locaux entament leur préparation dès la semaine prochaine. Le sélectionneur convoquera 30 joueurs pour un stage de deux semaines.\n\nLa RDC a déjà remporté cette compétition à deux reprises.',
    scope: 'INTERNATIONAL' as const,
    sport: 'FOOTBALL' as const,
    location: 'Maroc',
    source: 'CAF',
    breaking: false,
  },
  {
    title: 'Premier League : derby mancunien et choc au sommet ce week-end',
    excerpt:
      'Manchester United reçoit Manchester City dans le derby le plus attendu. Suivez la rencontre en direct sur GOAL ZONE TV.',
    content:
      'Le derby mancunien est l\'affiche de cette journée de Premier League. Manchester United reçoit Manchester City à Old Trafford.\n\nLes Citizens, leaders au classement, abordent ce match en pleine confiance. Les Red Devils, eux, cherchent à relancer leur saison après une série difficile.\n\nAu classement général, la lutte pour la qualification européenne s\'annonce plus ouverte que jamais, avec cinq clubs séparés par quatre points.\n\nCoup d\'envoi 17h30 heure de Lubumbashi.',
    scope: 'INTERNATIONAL' as const,
    sport: 'FOOTBALL' as const,
    location: 'Manchester, Angleterre',
    source: 'Premier League',
    breaking: false,
  },
]

export async function POST(req: NextRequest) {
  try {
    const count = await db.article.count()
    if (count > 0) {
      return NextResponse.json({
        seeded: false,
        message: 'La base contient déjà des articles. Seed ignoré.',
        count,
      })
    }

    let inserted = 0
    for (const a of SEED_ARTICLES) {
      const baseSlug = slugify(a.title) || `article-${Date.now()}-${inserted}`
      const existing = await db.article.findUnique({ where: { slug: baseSlug } })
      const slug = existing
        ? `${baseSlug}-${inserted}`
        : baseSlug
      await db.article.create({
        data: {
          title: a.title,
          slug,
          excerpt: a.excerpt,
          content: a.content,
          scope: a.scope,
          sport: a.sport,
          location: a.location,
          source: a.source || null,
          imageUrl: a.imageUrl || null,
          imageAlt: a.imageAlt || null,
          featured: a.featured || false,
          breaking: a.breaking || false,
          readMinutes: estimateReadMinutes(a.content),
          published: true,
        },
      })
      inserted++
    }

    return NextResponse.json({
      seeded: true,
      inserted,
      message: `${inserted} articles de démonstration insérés.`,
    })
  } catch (err) {
    console.error('[api/seed POST]', err)
    return NextResponse.json(
      { error: 'Seed impossible.' },
      { status: 500 },
    )
  }
}
