import { Calendar, People, Checklist } from "@/components/Icons";
import { MainNavigationItem } from "@/types";

const MainNavigation: MainNavigationItem[] = [
  {
    id: 'calendar',
    className: 'calendar',
    label: 'Team Calendar',
    path: '/team-calendar',
    icon: Calendar
  },
  {
    id: 'team',
    className: 'team',
    label: 'Team',
    path: '/team',
    icon: People
  },
  {
    id: 'schedule',
    className: 'schedule',
    label: 'Schedule',
    path: '/schedule',
    icon: Checklist
  },
];

export default MainNavigation;