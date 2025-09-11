import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MainNavigationConfig from '@/config/MainNavigation';

const MainNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav>
      {MainNavigationConfig.map((navItem) => {
        const Icon = navItem.icon;
        const isActive = pathname === navItem.path;
        
        return (
          <button
            key={navItem.id}
            id={`main-nav-${navItem.id}`}
            className={`main-nav-button ${navItem.className} ${isActive ? 'active' : ''}`}
            onClick={() => handleNavigation(navItem.path)}
          >
            <Icon />
          </button>
        );
      })}
    </nav>
  );
};

export default MainNavigation;