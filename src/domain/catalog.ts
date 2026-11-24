import type {
  Abnormality,
  OriginLetter,
  ReviewAxis,
  RiskIndex,
  RiskLevel,
  VerdictTier,
  WorkType,
} from './types'

export const RISKS: readonly RiskLevel[] = [
  { key: 'ZAYIN', color: '#35d07f' },
  { key: 'TETH', color: '#4aa8ff' },
  { key: 'HE', color: '#fff04a' },
  { key: 'WAW', color: '#a678ff' },
  { key: 'ALEPH', color: '#ff4040' },
]

export const ORIGIN: Readonly<Record<OriginLetter, string>> = {
  O: 'Original',
  T: 'Trauma',
  F: 'Fairy tale',
  D: 'Donation',
}

/** Form names by the middle pair of digits of a standard code. */
export const FORM: Readonly<Record<string, string>> = {
  '00': 'training dummy',
  '01': 'humanoid',
  '02': 'animal',
  '03': 'otherworldly',
  '04': 'inanimate',
  '05': 'machine or artifact',
  '06': 'abstract',
  '07': 'breaching tool',
  '09': 'tool',
}

export const WORKS: readonly WorkType[] = [
  { key: 'instinct', label: 'Instinct', color: '#e5484d' },
  { key: 'insight', label: 'Insight', color: '#f2efe6' },
  { key: 'attachment', label: 'Attachment', color: '#b07cff' },
  { key: 'repression', label: 'Repression', color: '#58c7d8' },
]

/** Review scales. A stored rating is 0 (not rated) or the level's 1-based position. */
export const AXES: readonly ReviewAxis[] = [
  { key: 'u', label: 'Usefulness', colorVar: '--useful', levels: ['Useless', 'Neutral', 'Useful'] },
  {
    key: 'd',
    label: 'Danger',
    colorVar: '--danger',
    levels: ['Peaceful', 'Safe-ish', 'Neutral', 'Dangerous', 'Extremely dangerous'],
  },
  {
    key: 'm',
    label: 'Management',
    colorVar: '--gold',
    levels: ['None', 'Periodic', 'Constant', 'Micromanage'],
  },
]

/** Verdicts by lowest score out of 10, highest first. */
export const VERDICTS: readonly VerdictTier[] = [
  { min: 8.5, call: 'Always pick', why: 'Low drama, high output. Promote it.' },
  { min: 6.5, call: 'Good pick', why: 'Earns its containment unit.' },
  { min: 4.5, call: 'Fair trade', why: 'You get about what you put up with.' },
  { min: 2.5, call: 'Only if desperate', why: 'The energy quota had better be worth it.' },
  { min: 0, call: 'Never again', why: 'Not worth the agents.' },
]

type RawRow = readonly [code: string, name: string, risk: RiskIndex, portrait: number, portraitPath: string]

/** Code, name, risk index, silhouette atlas cell, wiki portrait path. Roster order. */
const RAW: readonly RawRow[] = [
  ['O-03-03', 'One Sin and Hundreds of Good Deeds', 0, 0, '/images/OneSinPortrait.png?7ea8c0'],
  ['F-04-83', 'Fairy Festival', 0, 1, '/images/thumb/FairyFestivalPortrait.png/190px-FairyFestivalPortrait.png?18117c'],
  ['F-05-52', 'Opened Can of WellCheers', 0, 2, '/images/thumb/OpenedCanofWellcheersPortrait.png/190px-OpenedCanofWellcheersPortrait.png?dd5f56'],
  ['O-01-45', 'Plague Doctor', 0, 3, '/images/thumb/PlagueDoctorPortrait.png/190px-PlagueDoctorPortrait.png?4f9b25'],
  ['O-05-47', "Don't Touch Me", 0, 4, '/images/thumb/Don%27tTouchMePortrait.png/190px-Don%27tTouchMePortrait.png?2d1252'],
  ['O-09-81', 'Mirror of Adjustment', 0, 5, '/images/thumb/MirrorofAdjustmentPortrait.png/190px-MirrorofAdjustmentPortrait.png?f5d5a2'],
  ['T-09-85', 'We Can Change Anything', 0, 6, '/images/thumb/WeCanChangeAnythingPortrait.png/190px-WeCanChangeAnythingPortrait.png?e58ce6'],
  ['T-09-94', 'You Must Be Happy', 0, 7, '/images/thumb/YouMustBeHappyPortrait.png/190px-YouMustBeHappyPortrait.png?4885d6'],
  ['T-09-97', 'Old Faith and Promise', 0, 8, '/images/thumb/OldBeliefandPromisePortrait.png/190px-OldBeliefandPromisePortrait.png?88cb1b'],
  ['Bald-Is-Awesome!', "You're Bald...", 0, 9, '/images/thumb/You%27reBaldPortrait.png/190px-You%27reBaldPortrait.png?fddc6f'],
  ['D-01-106', 'Army in Black', 0, 10, '/images/thumb/ArmyInBlackPortrait.png/190px-ArmyInBlackPortrait.png?fe1add'],
  ['O-00-00', 'Standard Training-Dummy Rabbit', 1, 11, '/images/thumb/TrainingStandardDummyRabbitPortrait.png/190px-TrainingStandardDummyRabbitPortrait.png?2960b9'],
  ['T-06-27', '1.76 MHz', 1, 12, '/images/thumb/1.76MHzPortrait.png/190px-1.76MHzPortrait.png?93dcfc'],
  ['F-02-44', 'Beauty and the Beast', 1, 13, '/images/thumb/BeautyandtheBeastPortrait.png/190px-BeautyandtheBeastPortrait.png?8f24d7'],
  ['O-09-96', 'Behavior Adjustment', 1, 14, '/images/thumb/BehaviorAdjustmentPortrait.png/190px-BehaviorAdjustmentPortrait.png?713447'],
  ['T-05-51', 'Bloodbath', 1, 15, '/images/thumb/BloodbathPortrait.png/190px-BloodbathPortrait.png?39f68f'],
  ['O-05-61', 'Crumbling Armor', 1, 16, '/images/thumb/CrumblingArmorPortrait.png/190px-CrumblingArmorPortrait.png?c411bd'],
  ['T-01-54', 'Forsaken Murderer', 1, 17, '/images/thumb/ForsakenMurdererPortrait.png/190px-ForsakenMurdererPortrait.png?f3aaa2'],
  ['O-03-60', 'Fragment of the Universe', 1, 18, '/images/thumb/FragmentoftheUniversePortrait.png/190px-FragmentoftheUniversePortrait.png?68a405'],
  ['O-04-100', 'Grave of Cherry Blossoms', 1, 19, '/images/thumb/GraveofCherryBlossomsPortrait.png/190px-GraveofCherryBlossomsPortrait.png?243976'],
  ['O-09-95', 'Luminous Bracelet', 1, 20, '/images/thumb/LuminousBraceletPortrait.png/190px-LuminousBraceletPortrait.png?e6b5cd'],
  ['O-04-84', 'Meat Lantern', 1, 21, '/images/thumb/MeatLanternPortrait.png/190px-MeatLanternPortrait.png?51aa39'],
  ['O-01-12', 'Old Lady', 1, 22, '/images/OldLadyPortrait.png?3eebf9'],
  ['D-02-107', 'Ppodae', 1, 23, '/images/thumb/PpodaePortrait.png/190px-PpodaePortrait.png?f7fbaa'],
  ['O-02-56', 'Punishing Bird', 1, 24, '/images/thumb/PunishingBirdPortrait.png/190px-PunishingBirdPortrait.png?dd5d48'],
  ['F-01-02', 'Scorched Girl', 1, 25, '/images/ScorchedGirlPortrait.png?f4cf12'],
  ['T-09-90', 'Skin Prophecy', 1, 26, '/images/thumb/ProphecyoftheSkinPortrait.png/190px-ProphecyoftheSkinPortrait.png?2f83c1'],
  ['T-02-43', 'Spider Bud', 1, 27, '/images/thumb/SpiderBudPortrait.png/190px-SpiderBudPortrait.png?becf60'],
  ['T-09-77', 'The Heart of Aspiration', 1, 28, '/images/thumb/TheHeartofAspirationPortrait.png/190px-TheHeartofAspirationPortrait.png?68ae90'],
  ['F-01-18', 'The Lady Facing the Wall', 1, 29, '/images/WallGazerPortrait.png?6e4a5c'],
  ['T-09-09', 'Theresia', 1, 30, '/images/thumb/TheresiaPortrait.png/190px-TheresiaPortrait.png?3d88a4'],
  ['O-01-92', "Today's Shy Look", 1, 31, '/images/thumb/ShyLookTodayPortrait.png/190px-ShyLookTodayPortrait.png?b6de6b'],
  ['T-02-99', 'Void Dream', 1, 32, '/images/thumb/VoidDreamPortrait.png/190px-VoidDreamPortrait.png?3a4354'],
  ['T-05-41', 'All-Around Helper', 2, 33, '/images/LittleHelperPortrait.png?82236d'],
  ['O-01-55', 'Child of the Galaxy', 2, 34, '/images/thumb/TheChildofGalaxyPortrait.png/190px-TheChildofGalaxyPortrait.png?e6d826'],
  ['F-01-69', 'Der Freischütz', 2, 35, '/images/thumb/DerFreisch%C3%BCtzPortrait.png/190px-DerFreisch%C3%BCtzPortrait.png?a53d14'],
  ['T-01-68', 'Funeral of the Dead Butterflies', 2, 36, '/images/thumb/FuneraloftheDeadButterfliesPortrait.png/190px-FuneraloftheDeadButterfliesPortrait.png?88c54c'],
  ['T-09-80', 'Giant Tree Sap', 2, 37, '/images/thumb/GiantTreeSapPortrait.png/190px-GiantTreeSapPortrait.png?84389e'],
  ['T-04-06', 'Happy Teddy Bear', 2, 38, '/images/thumb/HappyTeddyBearPortrait.png/190px-HappyTeddyBearPortrait.png?b98e4f'],
  ['O-01-67', 'Laetitia', 2, 39, '/images/thumb/LaetitiaPortrait.png/190px-LaetitiaPortrait.png?78f065'],
  ['O-01-15', 'Nameless Fetus', 2, 40, '/images/thumb/NamelessFetusPortrait.png/190px-NamelessFetusPortrait.png?df0462'],
  ['T-09-78', 'Notes from a Crazed Researcher', 2, 41, '/images/thumb/NotefromaCrazedResearcherPortrait.png/190px-NotefromaCrazedResearcherPortrait.png?cf243b'],
  ['O-02-98', 'Porccubus', 2, 42, '/images/thumb/PorccubusPortrait.png/190px-PorccubusPortrait.png?55c0e8'],
  ['O-09-91', 'Portrait of Another World', 2, 43, '/images/thumb/PortraitofAnotherWorldPortrait.png/190px-PortraitofAnotherWorldPortrait.png?4032c3'],
  ['O-04-08', 'Red Shoes', 2, 44, '/images/RedShoesPortrait.png?d0df45'],
  ['F-02-49', 'Rudolta of the Sleigh', 2, 45, '/images/thumb/RudoltaPortrait.png/190px-RudoltaPortrait.png?c52a9a'],
  ['F-01-87', 'Scarecrow Searching for Wisdom', 2, 46, '/images/thumb/ScarecrowSearchingforWisdomPortrait.png/190px-ScarecrowSearchingforWisdomPortrait.png?6592d9'],
  ['O-05-76', 'Schadenfreude', 2, 47, '/images/thumb/SchadenfreudePortrait.png/190px-SchadenfreudePortrait.png?5087f6'],
  ['T-09-82', 'Shelter from the 27th of March', 2, 48, '/images/thumb/Shelterfromthe27thofMarchPortrait.png/190px-Shelterfromthe27thofMarchPortrait.png?fd0151'],
  ['O-05-30', 'Singing Machine', 2, 49, '/images/thumb/SingingMachinePortrait.png/190px-SingingMachinePortrait.png?180357'],
  ['F-01-37', 'The Snow Queen', 2, 50, '/images/thumb/TheSnowQueenPortrait.png/190px-TheSnowQueenPortrait.png?3a7917'],
  ['F-05-32', 'Warm-Hearted Woodsman', 2, 51, '/images/thumb/WarmHeartedWoodsmanPortrait.png/190px-WarmHeartedWoodsmanPortrait.png?3310fc'],
  ['T-04-53', 'Alriune', 3, 52, '/images/thumb/AlriunePortrait.png/190px-AlriunePortrait.png?edf417'],
  ['D-09-104', 'Backward Clock', 3, 53, '/images/thumb/BackwardClockPortrait.png/190px-BackwardClockPortrait.png?6f7c0b'],
  ['F-02-58', 'Big and Will Be Bad Wolf', 3, 54, '/images/thumb/BigandMightbeBadWolfPortrait.png/190px-BigandMightbeBadWolfPortrait.png?973f69'],
  ['O-02-40', 'Big Bird', 3, 55, '/images/thumb/BigBirdPortrait.png/190px-BigBirdPortrait.png?e9ad00'],
  ['D-01-110', 'Clouded Monk', 3, 56, '/images/thumb/HeroicMonkPortrait.png/190px-HeroicMonkPortrait.png?93fd2f'],
  ['O-03-88', 'Dimensional Refraction Variant', 3, 57, '/images/thumb/DimensionalRefractionVariantPortrait.png/190px-DimensionalRefractionVariantPortrait.png?d40e16'],
  ['F-02-70', 'Dream of a Black Swan', 3, 58, '/images/thumb/DreamofaBlackSwanPortrait.png/190px-DreamofaBlackSwanPortrait.png?7ce19a'],
  ['T-09-86', 'Express Train to Hell', 3, 59, '/images/thumb/ExpressTraintoHellPortrait.png/190px-ExpressTraintoHellPortrait.png?151beb'],
  ['T-09-79', 'Flesh Idol', 3, 60, '/images/thumb/FleshIdolPortrait.png/190px-FleshIdolPortrait.png?354ab2'],
  ['D-01-105', 'Il Pianto della Luna', 3, 61, '/images/thumb/LaLunaPortrait.png/190px-LaLunaPortrait.png?d50380'],
  ['O-02-62', 'Judgement Bird', 3, 62, '/images/thumb/BirdofJudgementPortrait.png/190px-BirdofJudgementPortrait.png?793437'],
  ['F-01-57', 'Little Red Riding Hooded Mercenary', 3, 63, '/images/thumb/LittleRedPortrait.png/190px-LittleRedPortrait.png?f9cf46'],
  ['D-04-108', 'Parasite Tree', 3, 64, '/images/thumb/ParasyteTreePortrait.png/190px-ParasyteTreePortrait.png?3c0e84'],
  ['T-04-50', 'Queen Bee', 3, 65, '/images/thumb/QueenBeePortrait.png/190px-QueenBeePortrait.png?a3731d'],
  ['F-04-42', "Snow White's Apple", 3, 66, '/images/thumb/SnowWhite%27sApplePortrait.png/190px-SnowWhite%27sApplePortrait.png?be1fb8'],
  ['O-04-72', 'The Burrowing Heaven', 3, 67, '/images/thumb/TheBurrowingHeavenPortrait.png/190px-TheBurrowingHeavenPortrait.png?669217'],
  ['T-02-71', 'The Dreaming Current', 3, 68, '/images/thumb/TheDreamingCurrentPortrait.png/190px-TheDreamingCurrentPortrait.png?8c1457'],
  ['O-02-101', 'The Firebird', 3, 69, '/images/thumb/FieryBirdPortrait.png/190px-FieryBirdPortrait.png?ec5545'],
  ['O-01-64', 'The King of Greed', 3, 70, '/images/thumb/TheKingofGreedPortrait.png/190px-TheKingofGreedPortrait.png?cf5ba9'],
  ['O-01-73', 'The Knight of Despair', 3, 71, '/images/thumb/TheKnightofDespairPortrait.png/190px-TheKnightofDespairPortrait.png?46a761'],
  ['O-04-66', 'The Little Prince', 3, 72, '/images/thumb/TheLittlePrincePortrait.png/190px-TheLittlePrincePortrait.png?5f26b5'],
  ['O-02-74', 'The Naked Nest', 3, 73, '/images/thumb/TheNakedNestPortrait.png/190px-TheNakedNestPortrait.png?aad729'],
  ['O-01-04', 'The Queen of Hatred', 3, 74, '/images/thumb/TheQueenOfHatredPortrait.png/190px-TheQueenOfHatredPortrait.png?9d9408'],
  ['O-07-103', 'Yang', 3, 75, '/images/thumb/YangPortrait.png/190px-YangPortrait.png?28d184'],
  ['O-05-102', 'Yin', 3, 76, '/images/thumb/YinPortrait.png/190px-YinPortrait.png?de7443'],
  ['O-02-63', 'Apocalypse Bird', 4, 77, '/images/thumb/ApocalypseBirdPortrait.png/190px-ApocalypseBirdPortrait.png?c512c1'],
  ['O-03-93', 'Blue Star', 4, 78, '/images/thumb/BlueStarPortrait.png/190px-BlueStarPortrait.png?aac391'],
  ['O-03-89', 'CENSORED', 4, 79, '/images/thumb/CENSOREDPortrait.png/190px-CENSOREDPortrait.png?d89141'],
  ['D-03-109', 'Melting Love', 4, 80, '/images/thumb/MeltingLovePortrait.png/190px-MeltingLovePortrait.png?8fa442'],
  ['T-01-75', 'Mountain of Smiling Bodies', 4, 81, '/images/thumb/TheMountainofSmilingBodiesPortrait.png/190px-TheMountainofSmilingBodiesPortrait.png?ecfc4e'],
  ['O-06-20', 'Nothing There', 4, 82, '/images/thumb/NothingTherePortrait.png/190px-NothingTherePortrait.png?bcc0dd'],
  ['T-01-31', 'The Silent Orchestra', 4, 83, '/images/thumb/TheSilentOrchestraPortrait.png/190px-TheSilentOrchestraPortrait.png?5101b0'],
  ['T-03-46', 'WhiteNight', 4, 84, '/images/thumb/WhiteNightPortrait.png/190px-WhiteNightPortrait.png?d2df4e'],
]

const STANDARD_CODE = /^([A-Z])-(\d\d)-(\d+)$/

function toAbnormality([code, name, risk, portrait, portraitPath]: RawRow): Abnormality {
  const m = STANDARD_CODE.exec(code)
  return {
    code,
    name,
    risk,
    portrait,
    portraitPath,
    letter: m ? (m[1] as OriginLetter) : null,
    form: m ? m[2]! : null,
    num: m ? parseInt(m[3]!, 10) : 999,
    tool: m ? m[2] === '09' || m[2] === '07' : true,
  }
}

export const ABNORMALITIES: readonly Abnormality[] = RAW.map(toAbnormality)

const BY_CODE = new Map(ABNORMALITIES.map((a) => [a.code, a]))

export function byCode(code: string): Abnormality | undefined {
  return BY_CODE.get(code)
}
