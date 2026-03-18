import { Zap } from 'pixelarticons/react/Zap'
import { RobotFace } from 'pixelarticons/react/RobotFace'
import { Chart } from 'pixelarticons/react/Chart'
import { Shield } from 'pixelarticons/react/Shield'
import { Sword } from 'pixelarticons/react/Sword'
import { SpeedFast } from 'pixelarticons/react/SpeedFast'
import { Target } from 'pixelarticons/react/Target'
import { Trophy } from 'pixelarticons/react/Trophy'
import { Crown } from 'pixelarticons/react/Crown'
import { Terminal } from 'pixelarticons/react/Terminal'
import { Cpu } from 'pixelarticons/react/Cpu'
import { Server } from 'pixelarticons/react/Server'
import { Globe } from 'pixelarticons/react/Globe'
import { Coins } from 'pixelarticons/react/Coins'
import { Sparkle } from 'pixelarticons/react/Sparkle'
import { Repeat } from 'pixelarticons/react/Repeat'
import { Database } from 'pixelarticons/react/Database'
import { Lock } from 'pixelarticons/react/Lock'
import { ChartBarBig } from 'pixelarticons/react/ChartBarBig'
import { Power } from 'pixelarticons/react/Power'
import { Login } from 'pixelarticons/react/Login'
import { Wallet } from 'pixelarticons/react/Wallet'
import { Search } from 'pixelarticons/react/Search'
import { Grid3x3 } from 'pixelarticons/react/Grid3x3'
import { Bulletlist } from 'pixelarticons/react/Bulletlist'
import { Menu } from 'pixelarticons/react/Menu'
import { Cancel } from 'pixelarticons/react/Cancel'
import { ArrowLeft } from 'pixelarticons/react/ArrowLeft'
import { ArrowRight } from 'pixelarticons/react/ArrowRight'
import { Check } from 'pixelarticons/react/Check'
import { Clock } from 'pixelarticons/react/Clock'
import { Folder } from 'pixelarticons/react/Folder'
import { Image } from 'pixelarticons/react/Image'
import { Loader } from 'pixelarticons/react/Loader'
import { Message } from 'pixelarticons/react/Message'
import { Note } from 'pixelarticons/react/Note'
import { PlusBox } from 'pixelarticons/react/PlusBox'
import { ListBox } from 'pixelarticons/react/ListBox'
import { FileText } from 'pixelarticons/react/FileText'
import { Plus } from 'pixelarticons/react/Plus'
import { ThumbsUp } from 'pixelarticons/react/ThumbsUp'
import { ThumbsDown } from 'pixelarticons/react/ThumbsDown'
import { ExternalLink } from 'pixelarticons/react/ExternalLink'
import { Calendar } from 'pixelarticons/react/Calendar'
import { CalendarText } from 'pixelarticons/react/CalendarText'
import { Article } from 'pixelarticons/react/Article'
import { ChevronRight } from 'pixelarticons/react/ChevronRight'
import { Bell } from 'pixelarticons/react/Bell'
import { Clipboard } from 'pixelarticons/react/Clipboard'
import { SettingsCog2 } from 'pixelarticons/react/SettingsCog2'
import { Briefcase } from 'pixelarticons/react/Briefcase'
import { ChevronsVertical } from 'pixelarticons/react/ChevronsVertical'
import { MoreVertical } from 'pixelarticons/react/MoreVertical'
import { User } from 'pixelarticons/react/User'

const icons = {
  zap: Zap,
  robot: RobotFace,
  chart: Chart,
  'chart-bar': ChartBarBig,
  shield: Shield,
  sword: Sword,
  speed: SpeedFast,
  target: Target,
  trophy: Trophy,
  crown: Crown,
  terminal: Terminal,
  cpu: Cpu,
  server: Server,
  globe: Globe,
  coins: Coins,
  sparkle: Sparkle,
  repeat: Repeat,
  database: Database,
  lock: Lock,
  power: Power,
  login: Login,
  wallet: Wallet,
  search: Search,
  grid: Grid3x3,
  list: Bulletlist,
  menu: Menu,
  close: Cancel,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  check: Check,
  clock: Clock,
  folder: Folder,
  image: Image,
  loader: Loader,
  message: Message,
  note: Note,
  'add-box': PlusBox,
  'list-box': ListBox,
  'file-text': FileText,
  plus: Plus,
  'thumbs-up': ThumbsUp,
  'thumbs-down': ThumbsDown,
  'external-link': ExternalLink,
  calendar: Calendar,
  'calendar-check': CalendarText,
  article: Article,
  'chevron-right': ChevronRight,
  coin: Coins,
  'edit-box': Article,
  notification: Bell,
  settings: SettingsCog2,
  briefcase: Briefcase,
  clipboard: Clipboard,
  'chevrons-vertical': ChevronsVertical,
  'more-vertical': MoreVertical,
  user: User,
}

export default function PixelIcon({ name, size = 24, className = '', style, ...rest }) {
  const Icon = icons[name] || icons.zap
  return (
    <Icon
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ imageRendering: 'pixelated', ...style }}
      shapeRendering="crispEdges"
      {...rest}
    />
  )
}
