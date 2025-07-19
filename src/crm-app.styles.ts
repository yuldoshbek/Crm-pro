// src/crm-app.styles.ts
import { css } from 'lit';

export const crmAppStyles = css`
  :host {
    display: block;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  .app-layout {
    display: flex;
    width: 100%;
    height: 100%;
    background-color: var(--bg-main);
  }
  
  .sidebar {
    width: 260px;
    flex-shrink: 0;
    background-color: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }
  .main-content {
    flex-grow: 1;
    padding: 2rem 3rem;
    overflow-y: auto;
  }

  .logo-section {
    padding-bottom: 1.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  .logo-section h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    background: linear-gradient(45deg, var(--accent-primary), #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-menu {
    flex-grow: 1;
  }
  .nav-menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .nav-menu li a {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.8rem 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .nav-menu li a:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
  .nav-menu li a.active {
    background-color: var(--accent-primary);
    color: white;
    box-shadow: var(--shadow-md);
  }
  /* ИСПРАВЛЕНИЕ: Используем flexbox для идеального центрирования иконки */
  .nav-menu li a .icon-wrapper {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
  }

  .user-profile {
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--accent-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .user-info {
    flex-grow: 1;
    overflow: hidden;
  }
  .user-email { 
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9rem;
  }
  .logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 1.2rem;
    padding: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .logout-btn:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
`;
