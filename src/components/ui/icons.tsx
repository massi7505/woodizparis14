/**
 * Animated icon library — wraps lucide-react icons with Tailwind hover animations.
 * Each component applies its own animation class so animations trigger on the icon's
 * own hover (or on a parent with `group` class via group-hover).
 */

import {
  Home, Link2, ClipboardList, Tag, Star, HelpCircle, Clock, Bell, Settings,
  ExternalLink, LogOut, X, Pencil, Trash2, Eye, Plus, Search, Upload,
  ChevronDown, ChevronUp, ChevronRight, Download, PanelLeftClose, PanelLeftOpen,
  ShoppingBag, UtensilsCrossed, MapPin, Phone, Mail, Globe, Heart,
  AlertCircle, CheckCircle, Info, Loader2, BarChart2, Copy,
} from 'lucide-react';

type IconProps = { className?: string };

export function HomeIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <Home className={`icon-hover-bounce transition-transform ${className}`} />;
}

export function LinkIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <Link2 className={`icon-hover-wiggle transition-transform ${className}`} />;
}

export function ClipboardIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <ClipboardList className={`icon-hover-bounce transition-transform ${className}`} />;
}

export function TagIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <Tag className={`icon-hover-wiggle transition-transform ${className}`} />;
}

export function StarIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <Star className={`icon-hover-pulse transition-transform ${className}`} />;
}

export function QuestionIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <HelpCircle className={`icon-hover-bounce transition-transform ${className}`} />;
}

export function ClockIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <Clock className={`icon-hover-spin transition-transform ${className}`} />;
}

export function BellIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <Bell className={`icon-hover-ring transition-transform ${className}`} />;
}

export function GearIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <Settings className={`icon-hover-spin transition-transform ${className}`} />;
}

export function ExternalLinkIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <ExternalLink className={`icon-hover-slide-right transition-transform ${className}`} />;
}

export function LogoutIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <LogOut className={`icon-hover-slide-right transition-transform ${className}`} />;
}

export function CloseIcon({ className = 'w-5 h-5' }: IconProps) {
  return <X className={`transition-transform duration-200 hover:rotate-90 ${className}`} />;
}

export function EditIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Pencil className={`icon-hover-wiggle transition-transform ${className}`} />;
}

export function TrashIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Trash2 className={`icon-hover-shake transition-transform ${className}`} />;
}

export function EyeIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Eye className={`icon-hover-blink transition-transform ${className}`} />;
}

export function PlusIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Plus className={`transition-transform duration-200 hover:rotate-90 ${className}`} />;
}

export function SearchIcon({ className = 'w-5 h-5' }: IconProps) {
  return <Search className={`icon-hover-pulse transition-transform ${className}`} />;
}

export function UploadIcon({ className = 'w-5 h-5' }: IconProps) {
  return <Upload className={`icon-hover-slide-up transition-transform ${className}`} />;
}

export function ChevronDownIcon({ className = 'w-4 h-4' }: IconProps) {
  return <ChevronDown className={`transition-transform duration-200 ${className}`} />;
}

export function ChevronSortUpIcon({ className = 'w-3 h-3' }: IconProps) {
  return <ChevronUp className={`transition-transform duration-150 hover:-translate-y-0.5 ${className}`} />;
}

export function ChevronSortDownIcon({ className = 'w-3 h-3' }: IconProps) {
  return <ChevronDown className={`transition-transform duration-150 hover:translate-y-0.5 ${className}`} />;
}

export function ArrowRightIcon({ className = 'w-4 h-4' }: IconProps) {
  return <ChevronRight className={`icon-hover-slide-right transition-transform ${className}`} />;
}

export function ImportIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Download className={`icon-hover-slide-up transition-transform ${className}`} />;
}

export function SidebarCollapseIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PanelLeftClose className={`transition-transform duration-200 hover:scale-110 ${className}`} />;
}

export function SidebarExpandIcon({ className = 'w-4 h-4' }: IconProps) {
  return <PanelLeftOpen className={`transition-transform duration-200 hover:scale-110 ${className}`} />;
}

// Extra icons available for use across the app
export function ShoppingBagIcon({ className = 'w-6 h-6' }: IconProps) {
  return <ShoppingBag className={`transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${className}`} />;
}

export function FoodIcon({ className = 'w-6 h-6' }: IconProps) {
  return <UtensilsCrossed className={`transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 ${className}`} />;
}

export function MapPinIcon({ className = 'w-4 h-4' }: IconProps) {
  return <MapPin className={`icon-hover-bounce transition-transform ${className}`} />;
}

export function PhoneIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Phone className={`icon-hover-ring transition-transform ${className}`} />;
}

export function MailIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Mail className={`icon-hover-bounce transition-transform ${className}`} />;
}

export function GlobeIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Globe className={`icon-hover-spin transition-transform ${className}`} />;
}

export function HeartIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Heart className={`icon-hover-pulse transition-transform ${className}`} />;
}

export function AlertIcon({ className = 'w-4 h-4' }: IconProps) {
  return <AlertCircle className={`icon-hover-shake transition-transform ${className}`} />;
}

export function CheckIcon({ className = 'w-4 h-4' }: IconProps) {
  return <CheckCircle className={`icon-hover-bounce transition-transform ${className}`} />;
}

export function InfoIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Info className={`icon-hover-pulse transition-transform ${className}`} />;
}

export function SpinnerIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function ChartIcon({ className = 'w-[18px] h-[18px]' }: IconProps) {
  return <BarChart2 className={`icon-hover-bounce transition-transform ${className}`} />;
}

export function CopyIcon({ className = 'w-4 h-4' }: IconProps) {
  return <Copy className={`icon-hover-bounce transition-transform ${className}`} />;
}
