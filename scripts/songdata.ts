export type MusicFile =
  | { type: 'lesson'; lesson: number; file: string; name: string }
  | { type: 'song'; file: string; artist: string; difficulty: string }

const lessons: MusicFile[] = [
  {
    lesson: 1,
    file: 'Oats_peas_beans_and_barley_grow.MID',
    name: 'Oats peas beans and barley grow',
  },
  {
    lesson: 2,
    file: 'Hot_cross_buns.MID',
    name: 'Hot cross buns',
  },
  {
    lesson: 3,
    file: 'Ode_to_joy.MID',
    name: 'Ode to joy',
  },
  {
    lesson: 4,
    file: 'Dies_Irae.MID',
    name: 'Dies Irae',
  },
  {
    lesson: 5,
    file: 'Jingle_bells.MID',
    name: 'Jingle bells',
  },
  {
    lesson: 6,
    file: 'Go_tell_aunt_rhody.MID',
    name: 'Go tell aunt rhody',
  },
  {
    lesson: 7,
    file: 'Mary_had_a_little_lamb.MID',
    name: 'Mary had a little lamb',
  },
  {
    lesson: 8,
    file: 'London_bridge.MID',
    name: 'London bridge',
  },
  {
    lesson: 9,
    file: 'A_TISKET_a_tasket.MID',
    name: 'A TISKET a tasket',
  },
  {
    lesson: 10,
    file: 'Twinkle_twinkle_little_star.MID',
    name: 'Twinkle twinkle little star',
  },
  {
    lesson: 11,
    file: 'Ach_du_lieber_augustin.MID',
    name: 'Ach du lieber augustin',
  },
  {
    lesson: 12,
    file: 'america_MY_COUNTry_tis_of_thee.MID',
    name: 'america MY COUNTry tis of thee',
  },
  {
    lesson: 13,
    file: 'Du_du_liegst_mir_im_herzen.MID',
    name: 'Du du liegst mir im herzen',
  },
  {
    lesson: 14,
    file: 'Largo.MID',
    name: 'Largo',
  },
  {
    lesson: 15,
    file: 'Row_your_boat.MID',
    name: 'Row your boat',
  },
  {
    lesson: 16,
    file: 'Three_blind_mice.MID',
    name: 'Three blind mice',
  },
  {
    lesson: 17,
    file: 'Swamp_samba.MID',
    name: 'Swamp samba',
  },
  {
    lesson: 18,
    file: 'Camptown_races.MID',
    name: 'Camptown races',
  },
  {
    lesson: 19,
    file: 'Shortnin_bread.MID',
    name: 'Shortnin bread',
  },
  {
    lesson: 20,
    file: 'Skip_to_my_lou.MID',
    name: 'Skip to my lou',
  },
  {
    lesson: 21,
    file: 'On_top_of_old_smokey.MID',
    name: 'On top of old smokey',
  },
  {
    lesson: 22,
    file: 'Drink_to_me_only_with_thine_eyes.MID',
    name: 'Drink to me only with thine eyes',
  },
  {
    lesson: 23,
    file: 'BRAHms_lullaby.MID',
    name: 'BRAHms lullaby',
  },
  {
    lesson: 24,
    file: 'BLOW_the_man_down.MID',
    name: 'BLOW the man down',
  },
  {
    lesson: 25,
    file: 'Heart_and_soul.MID',
    name: 'Heart and soul',
  },
  {
    lesson: 26,
    file: 'Heart_and_soul_melody.MID',
    name: 'Heart and soul melody',
  },
  {
    lesson: 27,
    file: 'The_rose.MID',
    name: 'The rose',
  },
  {
    lesson: 28,
    file: 'AU_Claire_de_la_lune.MID',
    name: 'AU Claire de la lune',
  },
  {
    lesson: 29,
    file: 'Old_macdonald.MID',
    name: 'Old macdonald',
  },
  {
    lesson: 30,
    file: 'FRERE_JAcques.MID',
    name: 'FRERE JAcques',
  },
  {
    lesson: 31,
    file: 'BINGO.MID',
    name: 'BINGO',
  },
  {
    lesson: 32,
    file: 'Love_me_tender.MID',
    name: 'Love me tender',
  },
  {
    lesson: 33,
    file: 'Darkeyes.MID',
    name: 'Darkeyes',
  },
  {
    lesson: 34,
    file: 'Hava_nagila.MID',
    name: 'Hava nagila',
  },
  {
    lesson: 35,
    file: 'Yesterday.MID',
    name: 'Yesterday',
  },
  {
    lesson: 36,
    file: 'Mack_the_knife.MID',
    name: 'Mack the knife',
  },
  {
    lesson: 37,
    file: 'Two_guitars.MID',
    name: 'Two guitars',
  },
  {
    lesson: 38,
    file: 'March_slav.MID',
    name: 'March slav',
  },
  {
    lesson: 39,
    file: 'Volga_boatman.MID',
    name: 'Volga boatman',
  },
  {
    lesson: 40,
    file: 'Minka.MID',
    name: 'Minka',
  },
  {
    lesson: 41,
    file: 'Carnival_of_venice.MID',
    name: 'Carnival of venice',
  },
  {
    lesson: 42,
    file: 'Farmer_in_the_dell.MID',
    name: 'Farmer in the dell',
  },
  {
    lesson: 43,
    file: 'Here_there_and_everywhere.MID',
    name: 'Here there and everywhere',
  },
  {
    lesson: 44,
    file: 'Ten_little_indians.MID',
    name: 'Ten little indians',
  },
  {
    lesson: 45,
    file: 'Puff_the_magic_dragon.MID',
    name: 'Puff the magic dragon',
  },
  {
    lesson: 46,
    file: 'ALOUETTE.MID',
    name: 'ALOUETTE',
  },
  {
    lesson: 47,
    file: 'Tambourine_man.MID',
    name: 'Tambourine man',
  },
  {
    lesson: 48,
    file: 'Chariots_of_fire.MID',
    name: 'Chariots of fire',
  },
  {
    lesson: 49,
    file: 'Kookaburra.MID',
    name: 'Kookaburra',
  },
  {
    lesson: 50,
    file: 'Manic_monday.MID',
    name: 'Manic monday',
  },
  {
    lesson: 51,
    file: 'Pachelbels_canon.MID',
    name: 'Pachelbels canon',
  },
  {
    lesson: 52,
    file: 'ANNIe_laurie.MID',
    name: 'ANNIe laurie',
  },
  {
    lesson: 53,
    file: 'The_entertainer.MID',
    name: 'The entertainer',
  },
  {
    lesson: 54,
    file: 'For_hes_a_jolly_good_fellow.MID',
    name: 'For hes a jolly good fellow',
  },
  {
    lesson: 55,
    file: 'BARCarolle_in_C.MID',
    name: 'BARCarolle in C',
  },
  {
    lesson: 56,
    file: 'Chopsticks.MID',
    name: 'Chopsticks',
  },
  {
    lesson: 57,
    file: 'Santa_lucia.MID',
    name: 'Santa lucia',
  },
  {
    lesson: 58,
    file: 'Theme_from_superman.MID',
    name: 'Theme from superman',
  },
  {
    lesson: 59,
    file: 'Bury_me_not_on_the_lone_prairie.MID',
    name: 'Bury me not on the lone prairie',
  },
  {
    lesson: 60,
    file: 'america_the_Beautiful.mid',
    name: '',
  },
  {
    lesson: 61,
    file: 'When_the_saints_go_marching_in.MID',
    name: 'When the saints go marching in',
  },
  {
    lesson: 62,
    file: 'BLUe_danube_waltz.MID',
    name: 'BLUe danube waltz',
  },
  {
    lesson: 63,
    file: 'The_first_noel.MID',
    name: 'The first noel',
  },
  {
    lesson: 64,
    file: 'Jesu_joy_of_mans_desiring.MID',
    name: 'Jesu joy of mans desiring',
  },
  {
    lesson: 65,
    file: 'HAPPY_birthday.MID',
    name: 'HAPPY birthday',
  },
  {
    lesson: 66,
    file: 'ANGELS_we_have_heard_on_high.MID',
    name: 'ANGELS we have heard on high',
  },
  {
    lesson: 67,
    file: 'Let_me_call_you_sweetheart.MID',
    name: 'Let me call you sweetheart',
  },
  {
    lesson: 68,
    file: 'AND_I_LOve_her.MID',
    name: 'AND I LOve her',
  },
  {
    lesson: 69,
    file: 'Beautiful_dreamer.MID',
    name: 'Beautiful dreamer',
  },
  {
    lesson: 70,
    file: 'Old_folks_at_home.MID',
    name: 'Old folks at home',
  },
  {
    lesson: 71,
    file: 'Oh_suzanna.MID',
    name: 'Oh suzanna',
  },
  {
    lesson: 72,
    file: 'Moondance_melody.MID',
    name: 'Moondance melody',
  },
  {
    lesson: 73,
    file: 'Moondance_harmony.MID',
    name: 'Moondance harmony',
  },
  {
    lesson: 74,
    file: 'Theme_from_a_summer_place.MID',
    name: 'Theme from a summer place',
  },
  {
    lesson: 75,
    file: 'waves_of_the_danube.MID',
    name: 'waves of the danube',
  },
  {
    lesson: 76,
    file: 'La_cinquantaine.MID',
    name: 'La cinquantaine',
  },
  {
    lesson: 77,
    file: 'When_irish_eyes_are_smiling.MID',
    name: 'When irish eyes are smiling',
  },
  {
    lesson: 78,
    file: 'Stand_by_me.MID',
    name: 'Stand by me',
  },
  {
    lesson: 79,
    file: 'Fur_elise.MID',
    name: 'Fur elise',
  },
  {
    lesson: 80,
    file: 'Red_river_valley.MID',
    name: 'Red river valley',
  },
  {
    lesson: 81,
    file: 'Funiculi_funicular.MID',
    name: 'Funiculi funicular',
  },
  {
    lesson: 82,
    file: 'Bicycle_built_for_two.MID',
    name: 'Bicycle built for two',
  },
  {
    lesson: 83,
    file: 'AVE_maria.MID',
    name: 'AVE maria',
  },
  {
    lesson: 84,
    file: 'Flow_gently_sweet_afton.MID',
    name: 'Flow gently sweet afton',
  },
  {
    lesson: 85,
    file: 'Home_on_the_range.MID',
    name: 'Home on the range',
  },
  {
    lesson: 86,
    file: 'Michelle.MID',
    name: 'Michelle',
  },
  {
    lesson: 87,
    file: 'Shell_be_coming_round_the_mountain.MID',
    name: 'Shell be coming round the mountain',
  },
  {
    lesson: 88,
    file: 'Beethovens_5th_symphony.MID',
    name: 'Beethovens 5th symphony',
  },
  {
    lesson: 89,
    file: 'Star_wars.MID',
    name: 'Star wars',
  },
  {
    lesson: 90,
    file: 'Frosty_the_snowman.MID',
    name: 'Frosty the snowman',
  },
  {
    lesson: 91,
    file: 'Yankee_doodle.MID',
    name: 'Yankee doodle',
  },
  {
    lesson: 92,
    file: 'The_swan.MID',
    name: 'The swan',
  },
  {
    lesson: 93,
    file: 'Yellow_submarine.MID',
    name: 'Yellow submarine',
  },
  {
    lesson: 94,
    file: 'Silent_night.MID',
    name: 'Silent night',
  },
  {
    lesson: 95,
    file: 'The_skaters_waltz.MID',
    name: 'The skaters waltz',
  },
  {
    lesson: 96,
    file: 'Fools_rush_in.MID',
    name: 'Fools rush in',
  },
  {
    lesson: 97,
    file: 'Merry_widow_waltz.MID',
    name: 'Merry widow waltz',
  },
  {
    lesson: 98,
    file: 'BRAhms_first_symphony.MID',
    name: 'BRAhms first symphony',
  },
  {
    lesson: 99,
    file: 'Dont_be_cruel.MID',
    name: 'Dont be cruel',
  },
  {
    lesson: 100,
    file: 'Give_my_regards_to_broadway.MID',
    name: 'Give my regards to broadway',
  },
  {
    lesson: 101,
    file: 'O_come_all_ye_faithful.MID',
    name: 'O come all ye faithful',
  },
  {
    lesson: 102,
    file: 'and_the_angels_sing.MID',
    name: 'and the angels sing',
  },
  {
    lesson: 103,
    file: 'Polovtzian_dance.MID',
    name: 'Polovtzian dance',
  },
  {
    lesson: 104,
    file: 'O_holy_night.MID',
    name: 'O holy night',
  },
  {
    lesson: 105,
    file: 'Youve_got_to_hide_your_love_away.MID',
    name: 'Youve got to hide your love away',
  },
  {
    lesson: 106,
    file: 'Musette_by_bach.MID',
    name: 'Musette by bach',
  },
  {
    lesson: 107,
    file: 'Theme_song_from_mash.MID',
    name: 'Theme song from mash',
  },
  {
    lesson: 108,
    file: 'Great_gate_of_kiev.MID',
    name: 'Great gate of kiev',
  },
  {
    lesson: 109,
    file: 'Handel_largo.MID',
    name: 'Handel largo',
  },
  {
    lesson: 110,
    file: 'Clair_de_lune.MID',
    name: 'Clair de lune',
  },
  {
    lesson: 111,
    file: 'Norwegian_wood.MID',
    name: 'Norwegian wood',
  },
  {
    lesson: 112,
    file: 'Surprise_symphony.MID',
    name: 'Surprise symphony',
  },
  {
    lesson: 113,
    file: 'Your_sixteen.MID',
    name: 'Your sixteen',
  },
  {
    lesson: 114,
    file: 'Greensleeves.MID',
    name: 'Greensleeves',
  },
  {
    lesson: 115,
    file: 'Paganini_caprice.MID',
    name: 'Paganini caprice',
  },
  {
    lesson: 116,
    file: 'Liebestraum.MID',
    name: 'Liebestraum',
  },
  {
    lesson: 117,
    file: 'Haydn_serenade.MID',
    name: 'Haydn serenade',
  },
  {
    lesson: 118,
    file: 'Romeo_juliet.MID',
    name: 'Romeo juliet',
  },
  {
    lesson: 119,
    file: 'Evergreen.MID',
    name: 'Evergreen',
  },
  {
    lesson: 120,
    file: 'Tea_for_two.MID',
    name: 'Tea for two',
  },
  {
    lesson: 121,
    file: 'Handels_WATER_music.MID',
    name: 'Handels WATER music',
  },
].map((elem) => ({
  ...elem,
  type: 'lesson',
  file: 'music/lessons/teachmid/' + elem.file,
}))

const songs: MusicFile[] = [
  {
    file: 'Fur_Elise.mid',
    name: 'Fur Elise',
    artist: 'Beethoven',
    difficulty: 'Easy',
  },
  {
    file: 'Abba - Dancing Queen.mid',
    name: 'Dancing Queen',
    artist: 'Abba',
    difficulty: 'Easy',
  },
  {
    file: 'Alan Walker - Darkside.mid',
    name: 'Darkside',
    artist: 'Alan Walker',
    difficulty: 'Easy',
  },
  {
    file: 'Alan Walker - On My Way.mid',
    name: 'On My Way',
    artist: 'Alan Walker',
    difficulty: 'Easy',
  },
  {
    file: 'Alan Walker - The Spectre.mid',
    name: 'The Spectre',
    artist: 'Alan Walker',
    difficulty: 'Easy',
  },
  {
    file: 'Alan_Walker_Faded.mid',
    name: 'Faded',
    artist: 'Alan Walker',
    difficulty: 'Easy',
  },
  {
    file: 'Alec Benjamin - Let Me Down Slowly.mid',
    name: 'Let Me Down Slowly',
    artist: 'Alec Benjamin',
    difficulty: 'Easy',
  },
  {
    file: 'Ariana Grande - Only 1.mid',
    name: 'Only 1',
    artist: 'Ariana Grande',
    difficulty: 'Easy',
  },
  {
    file: 'Attack_On_Titan_Theme_Guren_No_Yumiya.mid',
    name: 'Attack On Titan Theme Song',
    artist: 'Hiroyuki Sawano',
    difficulty: 'Easy',
  },
  {
    file: 'BTS - Black Swan.mid',
    name: 'Black Swan',
    artist: 'BTS',
    difficulty: 'Easy',
  },
  {
    file: 'BTS - Spring Day.mid',
    name: 'Spring Day',
    artist: 'BTS',
    difficulty: 'Easy',
  },
  {
    file: 'Backstreet Boys - I Need You Tonight.mid',
    name: 'I Need You Tonight',
    artist: 'Backstreet Boys',
    difficulty: 'Easy',
  },
  {
    file: 'Billie Eilish - Bad Guy.mid',
    name: 'Bad Guy',
    artist: 'Billie Eilish',
    difficulty: 'Easy',
  },
  {
    file: 'Billie Eilish - Six Feet Under.mid',
    name: 'Six Feet Under',
    artist: 'Billie Eilish',
    difficulty: 'Easy',
  },
  {
    file: 'Billie Eilish ft. Khalid - Lovely.mid',
    name: 'Lovely',
    artist: 'Billie Eilish ft. Khalid',
    difficulty: 'Easy',
  },
  {
    file: 'Breathe_No_More_-_Evanescence.mid',
    name: 'Breathe No More',
    artist: 'Evanescence',
    difficulty: 'Easy',
  },
  {
    file: 'Bruno Mars - Count On Me.mid',
    name: 'Count On Me',
    artist: 'Bruno Mars',
    difficulty: 'Easy',
  },
  {
    file: 'Bruno Mars - Talking to the Moon.mid',
    name: 'Talking to the Moon',
    artist: 'Bruno Mars',
    difficulty: 'Easy',
  },
  {
    file: 'Calum Scott - Dancing On My Own.mid',
    name: 'Dancing On My Own',
    artist: 'Calum Scott',
    difficulty: 'Easy',
  },
  {
    file: 'Calum Scott - You Are The Reason.mid',
    name: 'You Are The Reason',
    artist: 'Calum Scott',
    difficulty: 'Easy',
  },
  {
    file: 'Canon_Rock.xml',
    name: 'Canon Rock',
    artist: 'JerryC',
    difficulty: 'Easy',
  },
  {
    file: 'Clair_de_Lune.mid',
    name: 'Clair de Lune',
    artist: 'Isao Tomita',
    difficulty: 'Easy',
  },
  {
    file: 'Coldplay - Clocks.mid',
    name: 'Clocks',
    artist: 'Coldplay',
    difficulty: 'Easy',
  },
  {
    file: 'Craig Armstrong - Love Actually - Soundtrack.mid',
    name: 'Love Actually',
    artist: 'Craig Armstrong',
    difficulty: 'Easy',
  },
  {
    file: 'Curb Your Enthusiasm.mid',
    name: 'Curb Your Enthusiasm Theme Song',
    artist: 'Luciano Michelini',
    difficulty: 'Easy',
  },
  {
    file: 'Demi Lovato - Cool For The Summer.mid',
    name: 'Cool For The Summer',
    artist: 'Demi Lovato',
    difficulty: 'Easy',
  },
  {
    file: "Dua Lipa - Don't Start Now.mid",
    name: "Don't Start Now",
    artist: 'Dua Lipa',
    difficulty: 'Easy',
  },
  {
    file: 'Ed Sheeran - Nancy Mulligan.mid',
    name: 'Nancy Mulligan',
    artist: 'Ed Sheeran',
    difficulty: 'Easy',
  },
  {
    file: 'Ed Sheeran - Perfect.mid',
    name: 'Perfect',
    artist: 'Ed Sheeran',
    difficulty: 'Easy',
  },
  {
    file: 'Elton John - I am Still Standing.mid',
    name: 'I am Still Standing',
    artist: 'Elton John',
    difficulty: 'Easy',
  },
  {
    file: "Elvis Presley - Can't Help Falling in Love with You - EASY.mid",
    name: "Can't Help Falling in Love with You",
    artist: 'Elvis Presley',
    difficulty: 'Easy',
  },
  {
    file: 'Evanescence - My Immortal.mid',
    name: 'My Immortal',
    artist: 'Evanescence',
    difficulty: 'Easy',
  },
  {
    file: 'Game Of Thrones Theme - Easy.mid',
    name: 'Game Of Thrones Theme Song',
    artist: 'Ramin Djawadi',
    difficulty: 'Easy',
  },
  {
    file: 'Gravity Falls - Theme.mid',
    name: 'Gravity Falls Theme Song',
    artist: 'Brad Breeck',
    difficulty: 'Easy',
  },
  {
    file: "GunsNRoses - Sweet Child O' Mine.mid",
    name: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    difficulty: 'Easy',
  },
  {
    file: 'Happy Birthday - Chopin and Liszt style.mid',
    name: 'Happy Birthday',
    artist: 'Chopin and Liszt style',
    difficulty: 'Easy',
  },
  {
    file: 'Imagine Dragons - Believer.mid',
    name: 'Believer',
    artist: 'Imagine Dragons',
    difficulty: 'Easy',
  },
  {
    file: 'James Bay - Us.mid',
    name: 'Us',
    artist: 'James Bay',
    difficulty: 'Easy',
  },
  {
    file: 'James Blunt - You Are Beautiful - EASY.mid',
    name: 'You Are Beautiful',
    artist: 'James Blunt',
    difficulty: 'Easy',
  },
  {
    file: 'Johann Pachelbel - Canon in D - EASY.mid',
    name: 'Canon in D',
    artist: 'Johann Pachelbel',
    difficulty: 'Easy',
  },
  {
    file: 'John Denver - Take Me Home, Country Roads - EASY.mid',
    name: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    difficulty: 'Easy',
  },
  {
    file: 'Justin Bieber - Purpose.mid',
    name: 'Purpose',
    artist: 'Justin Bieber',
    difficulty: 'Easy',
  },
  {
    file: 'Linkin Park - In The End (Mellen Gi _ Tommee Profitt Remix).mid',
    name: 'Linkin Park - In The End (Tommee Profitt Remix)',
    artist: 'Linkin Park',
    difficulty: 'Easy',
  },
  {
    file: 'Ludwig Van Beethoven - 7th Symphony - 2nd movement - Easy.mid',
    name: '7th Symphony - 2nd movement',
    artist: 'Ludwig Van Beethoven',
    difficulty: 'Easy',
  },
  {
    file: 'Maroon 5 - Memories.mid',
    name: 'Memories',
    artist: 'Maroon 5',
    difficulty: 'Easy',
  },
  {
    file: 'Maroon 5 - Misery.mid',
    name: 'Misery',
    artist: 'Maroon 5',
    difficulty: 'Easy',
  },
  {
    file: 'Metallica_-_Nothing_Else_Matters_piano_solo.mid',
    name: 'Nothing Else Matters ',
    artist: 'Metallica',
    difficulty: 'Easy',
  },
  {
    file: 'Mozart - Lacrimosa (Requiem).mid',
    name: 'Lacrimosa (Requiem).mid',
    artist: 'Mozart',
    difficulty: 'Easy',
  },
  {
    file: 'Mozart - Sonata In C Major - K545 - EASY.mid',
    name: 'Sonata In C Major',
    artist: 'Mozart',
    difficulty: 'Easy',
  },
  {
    file: 'Mozart - Sonata no. 12, K332.mid',
    name: 'Sonata no. 12',
    artist: 'Mozart',
    difficulty: 'Easy',
  },
  {
    file: 'Mozart - Turkish March.midi',
    name: 'Turkish March',
    artist: 'Mozart',
    difficulty: 'Easy',
  },
  {
    file: 'My Chemical Romance - Teenagers.mid',
    name: 'Teenagers',
    artist: 'My Chemical Romance',
    difficulty: 'Easy',
  },
  {
    file: 'Panic! at the Disco - I Write Sins Not Tragedies.mid',
    name: 'I Write Sins Not Tragedies',
    artist: 'Panic! at the Disco',
    difficulty: 'Easy',
  },
  {
    file: 'Passenger - Let Her Go - EASY.mid',
    name: 'Let Her Go',
    artist: 'Passenger',
    difficulty: 'Easy',
  },
  {
    file: 'Persona 5 - Hymn of the Soul.mid',
    name: 'Persona 5 - Hymn of the Soul',
    artist: '',
    difficulty: 'Easy',
  },
  {
    file: 'Piano Hero 002 - Deadmau5 - Raise Your Weapon (Madeon Remix).mid',
    name: 'Raise Your Weapon (Madeon Remix)',
    artist: 'Deadmau5',
    difficulty: 'Easy',
  },
  {
    file: 'Piano Hero 003 - HearthStone - Main Theme.mid',
    name: 'HearthStone - Main Theme.mid',
    artist: '',
    difficulty: 'Easy',
  },
  {
    file: 'Piano Hero 007 - Hardwell - Mad World.mid',
    name: 'Mad World',
    artist: 'Hardwell',
    difficulty: 'Easy',
  },
  {
    file: 'Piano Hero 009 - Adele - Hello.mid',
    name: 'Hello',
    artist: 'Adele',
    difficulty: 'Easy',
  },
  {
    file: 'Piano Hero 010 - DragonForce - Through The Fire And Flames.mid',
    name: 'Through The Fire And Flames',
    artist: 'DragonForce',
    difficulty: 'Hard',
  },
  {
    file: 'Piano Hero 014 - Feed Me - One Click Headshot.mid',
    name: 'One Click Headshot',
    artist: 'Feed Me',
    difficulty: 'Easy',
  },
  {
    file: 'Piano Hero 015 - Fort Minor - Remember The Name.mid',
    name: 'Remember The Name',
    artist: 'Fort Minor',
    difficulty: 'Easy',
  },
  {
    file: 'Piano_Man_Piano.mid',
    name: 'Piano Man',
    artist: 'Billy Joel',
    difficulty: 'Easy',
  },
  {
    file: 'Pokemon_Theme_Song_piano.mid',
    name: 'Pokemon Theme Song',
    artist: 'John Siegler & Tamara Loeffler',
    difficulty: 'Easy',
  },
  {
    file: 'Requiem for a dream.mid',
    name: 'Requiem for a dream',
    artist: 'Clint Mansell',
    difficulty: 'Easy',
  },
  {
    file: 'RiverFlowsInYou.mid',
    name: 'River Flows In You',
    artist: 'Yiruma',
    difficulty: 'Easy',
  },
  {
    file: 'Sam Smith - Lay Me Down - EASY.mid',
    name: 'Lay Me Down',
    artist: 'Sam Smith',
    difficulty: 'Easy',
  },
  {
    file: 'Scott-Joplin-The-Entertainer.mid',
    name: 'The Entertainer',
    artist: 'Scott Joplin',
    difficulty: 'Easy',
  },
  {
    file: 'Shawn Mendes - Life of The Party.mid',
    name: 'Life of The Party',
    artist: 'Shawn Mendes',
    difficulty: 'Easy',
  },
  {
    file: 'Shawn Mendes, Camila Cabello - Senorita.mid',
    name: 'Senorita',
    artist: 'Shawn Mendes, Camila Cabello',
    difficulty: 'Easy',
  },
  {
    file: 'Steven Universe - Amalgam.mid',
    name: 'Amalgam',
    artist: 'Steven Universe',
    difficulty: 'Medium',
  },
  {
    file: 'Steven Universe - Full Theme.mid',
    name: 'Steven Universe Full Theme',
    artist: '',
    difficulty: 'Easy',
  },
  {
    file: 'Steven Universe - Love Like You.mid',
    name: 'Love Like You',
    artist: 'Steven Universe',
    difficulty: 'Easy',
  },
  {
    file: 'Sting - Every Breath You Take.mid',
    name: 'Every Breath You Take',
    artist: 'Sting',
    difficulty: 'Easy',
  },
  {
    file: 'Sting - Fields of Gold.mid',
    name: 'Fields of Gold',
    artist: 'Sting',
    difficulty: 'Easy',
  },
  {
    file: 'Stranger Things - Theme.mid',
    name: 'Stranger Things - Theme.mid',
    artist: 'Kyle Dixon & Michael Stein',
    difficulty: 'Easy',
  },
  {
    file: 'The Beatles (John Lennon) - Real Love.mid',
    name: 'Real Love',
    artist: 'The Beatles',
    difficulty: 'Easy',
  },
  {
    file: 'The Beatles (John Lennon) - Twist and Shout.mid',
    name: 'Twist and Shout',
    artist: 'The Beatles',
    difficulty: 'Easy',
  },
  {
    file: 'The Beatles - Let it Be.mid',
    name: 'Let it Be',
    artist: 'The Beatles',
    difficulty: 'Easy',
  },
  {
    file: 'The Cranberries - ZOMBIE.mid',
    name: 'ZOMBIE',
    artist: 'The Cranberries',
    difficulty: 'Easy',
  },
  {
    file: 'The Office.xml',
    name: 'The Office Theme Song',
    artist: 'Jay Ferguson',
    difficulty: 'Easy',
  },
  {
    file: 'The Weeknd - Blinding Lights.mid',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    difficulty: 'Easy',
  },
  {
    file: 'The_Scientist_-_Coldplay_Piano_Arrangement.mid',
    name: 'The Scientist',
    artist: 'Coldplay',
    difficulty: 'Easy',
  },
  {
    file: 'Tones and I - Dance Monkey.mid',
    name: 'Dance Monkey',
    artist: 'Tones and I',
    difficulty: 'Easy',
  },
  {
    file: 'Twenty One Pilots - Trees - EASY.mid',
    name: 'Trees',
    artist: 'Twenty One Pilots',
    difficulty: 'Easy',
  },
  {
    file: 'Westworld_Theme.mid',
    name: 'Westworld Theme.mid',
    artist: 'Ramin Djawadi',
    difficulty: 'Easy',
  },
  {
    file: 'XXXTENTACION - Sad!.mid',
    name: 'Sad!',
    artist: 'XXXTENTACION',
    difficulty: 'Easy',
  },
  {
    file: 'Yiruma - Spring Time.mid',
    name: 'Spring Time',
    artist: 'Yiruma',
    difficulty: 'Easy',
  },
  {
    file: 'canond-easy.xml',
    name: 'Canon in D Major',
    artist: 'Pachelbel',
    difficulty: 'Easy',
  },
  {
    file: 'drake-passionfruit.xml',
    name: 'Passionfruit',
    artist: 'Drake',
    difficulty: 'Easy',
  },
  {
    file: 'fireflies.mid',
    name: 'Fireflies',
    artist: 'Owl City',
    difficulty: 'Medium',
  },
  {
    file: 'lose-yourself.xml',
    name: 'Lose Yourself',
    artist: 'Eminem',
    difficulty: 'Easy',
  },
  {
    file: 'moonlight-sonata.xml',
    name: 'Moonlight Sonata',
    artist: 'Beethoven',
    difficulty: 'Easy',
  },
  {
    file: 'xx-intro.mid',
    name: 'Intro',
    artist: 'The XX',
    difficulty: 'Easy',
  },
  {
    file: 'imagine_dragons-radioactive_piano_version.mid',
    name: 'Radioactive (new)',
    artist: 'Imagine Dragons',
    difficulty: 'Easy',
  },
  {
    file: 'Pans_Labyrinth_Lullaby.mid',
    name: 'Pans Labrynth Lullaby',
    artist: 'Javier Navarrete',
    difficulty: 'Easy',
  },
  {
    file: 'All_Eyes_On_Me__Bo_Burnham_Easy_Piano.mid',
    name: 'All Eyes On Me',
    artist: 'Bo Burnham',
    difficulty: 'Medium',
  },
  {
    file: 'Sweet Hibiscus Tea.mid',
    name: 'Sweet Hibiscus Tea',
    artist: 'Penelope Scott',
    difficulty: 'Easy',
  },
  {
    file: 'Bloom.Sweet_Hibiscus_Tea Piano Beginner.mid',
    name: 'Bloom: Sweet Hibiscus Tea',
    artist: 'Penelope Scott',
    difficulty: 'Easy',
  },
  {
    file: 'Bloom.Let_It_Be Piano Beginner.mid',
    name: 'Bloom: Let It Be',
    artist: 'Beatles',
    difficulty: 'Easy',
  },
  {
    file: 'Bloom.Imagine John Lennon Beginner.mid',
    name: 'Bloom: Imagine',
    artist: 'Beatles',
    difficulty: 'Easy',
  },
  {
    file: 'Bloom.Into_The_Unknown.mid',
    name: 'Bloom: Into The Unknown',
    artist: 'Over The Garden Wall',
    difficulty: 'Medium',
  },
  {
    file: 'Bloom.Here_Comes_The_Sun The Beatles Piano Beginner.mid',
    name: 'Bloom: Here Comes The Sun',
    artist: 'Beatles',
    difficulty: 'Easy',
  },
  {
    file: "Bloom.People_Can't_Stop_Chillin.mid",
    name: "Bloom: People Can't Stop Chilling",
    artist: 'Sports',
    difficulty: 'Easy',
  },
  {
    file: "Bloom.People_Can't_Stop_Chillin_Added.mid",
    name: "Bloom: People Can't Stop Chilling With Accompaniments",
    artist: 'Sports',
    difficulty: 'Easy',
  },
  {
    file: 'Kingdom Hearts - Simple and Clean (antonlab).mid',
    name: 'Simple and Clean',
    artist: 'Kingdom Hearts (antonlab)',
    difficulty: 'Easy',
  },
  {
    file: 'Aphex_Twin_Avril_14th.mid',
    name: 'Avril 14',
    artist: 'Aphex Twin',
    difficulty: 'Easy',
  },
  {
    file: 'Bloom.Greensleeves.Beginner.mid',
    name: 'Bloom: Greensleeves',
    artist: 'Celtic Ladies',
    difficulty: 'Easy',
  },
  {
    file: 'Bloom.Avril14.mid',
    name: 'Bloom: Avril 14',
    artist: 'Aphex Twin',
    difficulty: 'Easy',
  },
  {
    file: 'Scarborough_Fair_Easy.mid',
    name: 'Scarborough Fair',
    artist: 'Simon and Garfunkel',
    difficulty: 'Easy',
  },
  {
    file: 'Bloom.j1.mid',
    name: 'j1',
    artist: 'Jake Fried',
    difficulty: 'Easy',
  },
  {
    file: 'One_Final_Effort.mid',
    name: 'Halo 3: One Final Effort',
    artist: "Martin O' Donnel",
    difficulty: 'Easy',
  },
  {
    file: 'Gymnopedie_No_1.mid',
    name: 'Gymnopedie No 1',
    artist: 'Satie',
    difficulty: 'Easy',
  },
].map((elem) => ({ ...elem, type: 'song', file: 'music/songs/' + elem.file }))

const musicFiles: MusicFile[] = songs.concat(lessons)

export { musicFiles }
