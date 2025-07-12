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
    background-color: #f7f8fc;
  }
  
  .sidebar {
    width: 260px;
    flex-shrink: 0;
    background-color: #ffffff;
    border-right: 1px solid var(--border-color);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
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
  }

  .nav-menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .nav-menu li a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .nav-menu li a:hover {
    background-color: #f0f3f8;
    color: var(--accent-primary);
  }
  .nav-menu li a.active {
    background-color: var(--accent-primary);
    color: white;
    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
  }
  .nav-menu li a i {
    width: 20px;
    text-align: center;
  }

  .user-profile {
    margin-top: auto;
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
  }
  .user-email { font-weight: 500; }
  .logout-btn {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 1.2rem;
  }
`;