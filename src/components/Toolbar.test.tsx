import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  const defaultProps = {
    onCopy: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenHistory: vi.fn(),
    platform: 'linkedin',
    setPlatform: vi.fn(),
    theme: 'light',
    toggleTheme: vi.fn(),
    isCopying: false,
    isLoadingHistory: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render logo and app name', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByText('Markdown2Social')).toBeInTheDocument();
    });

    it('should render PlatformSelect component', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByLabelText('Select social media platform')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByLabelText('Open conversion history')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Open style settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy formatted content to clipboard')).toBeInTheDocument();
    });

    it('should show History button text', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByText('History')).toBeInTheDocument();
    });

    it('should show Styles button text', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByText('Styles')).toBeInTheDocument();
    });

    it('should show Copy button text', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  describe('theme button', () => {
    it('should show moon icon in light mode', () => {
      render(<Toolbar {...defaultProps} theme="light" />);

      const themeButton = screen.getByLabelText('Switch to dark mode');
      expect(themeButton).toBeInTheDocument();
    });

    it('should show sun icon in dark mode', () => {
      render(<Toolbar {...defaultProps} theme="dark" />);

      const themeButton = screen.getByLabelText('Switch to light mode');
      expect(themeButton).toBeInTheDocument();
    });

    it('should call toggleTheme when clicked', async () => {
      const mockToggleTheme = vi.fn();
      render(<Toolbar {...defaultProps} theme="light" toggleTheme={mockToggleTheme} />);

      const themeButton = screen.getByLabelText('Switch to dark mode');
      await userEvent.click(themeButton);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('copy button', () => {
    it('should call onCopy when clicked', async () => {
      const mockOnCopy = vi.fn();
      render(<Toolbar {...defaultProps} onCopy={mockOnCopy} />);

      const copyButton = screen.getByLabelText('Copy formatted content to clipboard');
      await userEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when isCopying is true', () => {
      render(<Toolbar {...defaultProps} isCopying={true} />);

      const copyButton = screen.getByLabelText('Copy formatted content to clipboard');
      expect(copyButton).toHaveAttribute('aria-busy', 'true');
      expect(copyButton).toBeDisabled();
      expect(screen.getByText('Copying...')).toBeInTheDocument();
    });

    it('should not be disabled when not copying', () => {
      render(<Toolbar {...defaultProps} isCopying={false} />);

      const copyButton = screen.getByLabelText('Copy formatted content to clipboard');
      expect(copyButton).not.toBeDisabled();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('should have primary class on copy button', () => {
      render(<Toolbar {...defaultProps} />);

      const copyButton = screen.getByLabelText('Copy formatted content to clipboard');
      expect(copyButton).toHaveClass('primary');
    });
  });

  describe('history button', () => {
    it('should call onOpenHistory when clicked', async () => {
      const mockOnOpenHistory = vi.fn();
      render(<Toolbar {...defaultProps} onOpenHistory={mockOnOpenHistory} />);

      const historyButton = screen.getByLabelText('Open conversion history');
      await userEvent.click(historyButton);

      expect(mockOnOpenHistory).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when isLoadingHistory is true', () => {
      render(<Toolbar {...defaultProps} isLoadingHistory={true} />);

      const historyButton = screen.getByLabelText('Open conversion history');
      expect(historyButton).toHaveAttribute('aria-busy', 'true');
      expect(historyButton).toBeDisabled();
    });

    it('should have aria-haspopup attribute', () => {
      render(<Toolbar {...defaultProps} />);

      const historyButton = screen.getByLabelText('Open conversion history');
      expect(historyButton).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('settings button', () => {
    it('should call onOpenSettings when clicked', async () => {
      const mockOnOpenSettings = vi.fn();
      render(<Toolbar {...defaultProps} onOpenSettings={mockOnOpenSettings} />);

      const settingsButton = screen.getByLabelText('Open style settings');
      await userEvent.click(settingsButton);

      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('should have aria-haspopup attribute', () => {
      render(<Toolbar {...defaultProps} />);

      const settingsButton = screen.getByLabelText('Open style settings');
      expect(settingsButton).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('platform select', () => {
    it('should pass platform to PlatformSelect', () => {
      render(<Toolbar {...defaultProps} platform="twitter" />);

      const platformSelect = screen.getByLabelText('Select social media platform');
      expect(platformSelect).toBeInTheDocument();
    });

    it('should call setPlatform when platform changes', async () => {
      const mockSetPlatform = vi.fn();
      render(<Toolbar {...defaultProps} setPlatform={mockSetPlatform} />);

      const platformSelect = screen.getByLabelText('Select social media platform');
      await userEvent.click(platformSelect);

      const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
      await userEvent.click(twitterOption);

      expect(mockSetPlatform).toHaveBeenCalledWith('twitter');
    });
  });

  describe('accessibility', () => {
    it('should have correct header role', () => {
      render(<Toolbar {...defaultProps} />);

      const header = screen.getByLabelText('Application toolbar');
      expect(header.tagName.toLowerCase()).toBe('header');
    });

    it('should have banner role on header', () => {
      render(<Toolbar {...defaultProps} />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should have navigation region for actions', () => {
      render(<Toolbar {...defaultProps} />);

      const nav = screen.getByLabelText('Main actions');
      expect(nav.tagName.toLowerCase()).toBe('nav');
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(<Toolbar {...defaultProps} />);

      const ariaHiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(ariaHiddenIcons.length).toBeGreaterThan(0);
    });
  });

  describe('props combinations', () => {
    it('should handle all buttons loading simultaneously', () => {
      render(<Toolbar {...defaultProps} isCopying={true} isLoadingHistory={true} />);

      const copyButton = screen.getByLabelText('Copy formatted content to clipboard');
      const historyButton = screen.getByLabelText('Open conversion history');

      expect(copyButton).toBeDisabled();
      expect(historyButton).toBeDisabled();
    });

    it('should handle rapid button clicks', async () => {
      const mockOnCopy = vi.fn();
      render(<Toolbar {...defaultProps} onCopy={mockOnCopy} />);

      const copyButton = screen.getByLabelText('Copy formatted content to clipboard');

      // Click multiple times rapidly
      await userEvent.click(copyButton);
      await userEvent.click(copyButton);
      await userEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledTimes(3);
    });
  });
});
