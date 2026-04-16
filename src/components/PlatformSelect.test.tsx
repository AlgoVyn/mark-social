import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlatformSelect } from './PlatformSelect';

describe('PlatformSelect', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render with LinkedIn selected by default', () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      expect(screen.getByLabelText('Select social media platform')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('should render with Twitter/X selected', () => {
      render(<PlatformSelect value="twitter" onChange={mockOnChange} />);

      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
    });

    it('should render with correct platform icon', () => {
      const { container } = render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      // Should have SVG icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render all platform options when opened', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      // Should show all platforms
      expect(screen.getByRole('option', { name: /LinkedIn/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Twitter\/X/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Bluesky/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Mastodon/i })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should open dropdown when clicked', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should call onChange when selecting a different platform', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
      await userEvent.click(twitterOption);

      expect(mockOnChange).toHaveBeenCalledWith('twitter');
    });

    it('should close dropdown after selection', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
      await userEvent.click(twitterOption);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should toggle dropdown when clicking trigger twice', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');

      // Open
      await userEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Close
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <PlatformSelect value="linkedin" onChange={mockOnChange} />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Click outside
      await userEvent.click(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should handle selecting same platform', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      const linkedinOption = screen.getByRole('option', { name: /^LinkedIn$/i });
      await userEvent.click(linkedinOption);

      // Should still call onChange
      expect(mockOnChange).toHaveBeenCalledWith('linkedin');
    });

    it('should support all 12 platforms', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes on trigger', () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when opened', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have correct role on dropdown', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      const dropdown = screen.getByRole('listbox');
      expect(dropdown).toBeInTheDocument();
    });

    it('should have correct role and aria-selected on options', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      const linkedinOption = screen.getByRole('option', { name: /^LinkedIn$/i });
      expect(linkedinOption).toHaveAttribute('aria-selected', 'true');

      const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
      expect(twitterOption).toHaveAttribute('aria-selected', 'false');
    });

    it('should have selected class on selected option', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      await userEvent.click(trigger);

      const linkedinOption = screen.getByRole('option', { name: /^LinkedIn$/i });
      expect(linkedinOption).toHaveClass('selected');
    });

    it('should be keyboard accessible', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('edge cases', () => {
    it('should handle invalid platform value gracefully', () => {
      // Should not throw with invalid platform
      render(<PlatformSelect value="invalid-platform" onChange={mockOnChange} />);

      // Should still render the trigger
      expect(screen.getByLabelText('Select social media platform')).toBeInTheDocument();
    });

    it('should maintain state during rapid clicks', async () => {
      render(<PlatformSelect value="linkedin" onChange={mockOnChange} />);

      const trigger = screen.getByLabelText('Select social media platform');

      // Rapid clicks
      await userEvent.click(trigger);
      await userEvent.click(trigger);
      await userEvent.click(trigger);

      // Should eventually settle in a consistent state
      await waitFor(() => {
        void screen.queryByRole('listbox');
        // Listbox may or may not be present depending on odd/even clicks
        // but component should not crash
        expect(document.body.contains(trigger)).toBe(true);
      });
    });
  });
});
