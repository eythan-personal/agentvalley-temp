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
}

export default function PixelIcon({ name, size = 24, className = '', ...rest }) {
  const Icon = icons[name] || icons.zap
  return <Icon width={size} height={size} className={className} aria-hidden="true" {...rest} />
}
