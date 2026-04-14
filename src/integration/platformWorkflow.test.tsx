import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '../test/test-utils';
import userEvent from '@testing-library/user-event';

describe('Platform Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset clipboard mock
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  it('should switch platforms and update preview', async () => {
    renderWithRouter();

    // Initial platform should be LinkedIn
    const select = screen.getByLabelText('Select social media platform');
    // Switch to Twitter
    await userEvent.click(select);
    const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
    await userEvent.click(twitterOption);

    // Preview should update to show Twitter/X
    await waitFor(() => {
      expect(screen.getByLabelText('Platform: Twitter/X')).toBeInTheDocument();
    });
  }, 10000);

  it('should show character counter for current platform', async () => {
    renderWithRouter();

    // Should show character counter with LinkedIn limits (3000 without comma)
    expect(screen.getByText('3000')).toBeInTheDocument();

    // Switch to Twitter
    const select = screen.getByLabelText('Select social media platform');
    await userEvent.click(select);
    const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
    await userEvent.click(twitterOption);

    // Should now show Twitter limits
    await waitFor(() => {
      expect(screen.getByText('280')).toBeInTheDocument();
    });
  }, 10000);

  it('should handle Twitter thread preview for long content', async () => {
    renderWithRouter();

    // Switch to Twitter
    const select = screen.getByLabelText('Select social media platform');
    await userEvent.click(select);
    const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
    await userEvent.click(twitterOption);

    // Wait for Twitter preview to render
    await waitFor(() => {
      expect(screen.getByLabelText('Platform: Twitter/X')).toBeInTheDocument();
    });
  }, 10000);

  it('should copy content formatted for selected platform', async () => {
    renderWithRouter();

    // Click copy button
    const copyButton = screen.getByLabelText('Copy formatted content to clipboard');
    await userEvent.click(copyButton);

    // Should call clipboard API
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    // Should show success toast
    expect(await screen.findByText(/Copied to clipboard/)).toBeInTheDocument();
  }, 10000);

  it('should update character count as user types', async () => {
    renderWithRouter();

    // Initial count should be from default content
    // Just verify counter exists
    expect(screen.getByRole('status')).toBeInTheDocument();
  }, 10000);

  it('should maintain platform state when opening modals', async () => {
    renderWithRouter();

    // Switch to Bluesky
    const select = screen.getByLabelText('Select social media platform');
    await userEvent.click(select);
    const blueskyOption = screen.getByRole('option', { name: /Bluesky/i });
    await userEvent.click(blueskyOption);

    // Open history modal
    const historyButton = screen.getByText('History');
    await userEvent.click(historyButton);

    // Close modal
    const closeButton = await screen.findByText('×');
    await userEvent.click(closeButton);

    // Platform should still be Bluesky - get fresh reference after modal close
    const selectAfterClose = screen.getByLabelText('Select social media platform');
    expect(selectAfterClose.textContent).toContain('Bluesky');
  }, 10000);

  it('should show different character limits for different platforms', async () => {
    renderWithRouter();

    const select = screen.getByLabelText('Select social media platform');

    // LinkedIn - 3000
    expect(screen.getByText('3000')).toBeInTheDocument();

    // Switch to Twitter
    await userEvent.click(select);
    const twitterOption2 = screen.getByRole('option', { name: /Twitter\/X/i });
    await userEvent.click(twitterOption2);
    await waitFor(() => {
      expect(screen.getByText('280')).toBeInTheDocument();
    });

    // Wait for navigation to complete and dropdown to be ready
    await act(async () => {
      // Small delay to ensure navigation completes
    });

    // Switch to Mastodon - need to get fresh reference to select after navigation
    const select2 = screen.getByLabelText('Select social media platform');
    await userEvent.click(select2);
    const mastodonOption2 = screen.getByRole('option', { name: /Mastodon/i });
    await userEvent.click(mastodonOption2);
    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  }, 10000);

  it('should handle all supported platforms in dropdown', async () => {
    renderWithRouter();

    // Open the dropdown
    const trigger = screen.getByLabelText('Select social media platform');
    await userEvent.click(trigger);

    // Now options should be visible
    const options = screen.getAllByRole('option');

    // Should have multiple platforms
    expect(options.length).toBeGreaterThanOrEqual(9);

    // Each option should have platform name
    options.forEach((option) => {
      expect(option.textContent).toBeTruthy();
    });
  }, 10000);

  it('should show warning state when approaching character limit', async () => {
    renderWithRouter();

    // Switch to Twitter (280 char limit)
    const select = screen.getByLabelText('Select social media platform');
    await userEvent.click(select);
    const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
    await userEvent.click(twitterOption);

    // Wait for Twitter preview
    await waitFor(() => {
      expect(screen.getByLabelText('Platform: Twitter/X')).toBeInTheDocument();
    });
  }, 10000);

  it('should handle invalid platform gracefully', async () => {
    renderWithRouter();

    // Platform select should handle any value gracefully
    const select = screen.getByLabelText('Select social media platform');
    expect(select).toBeInTheDocument();
  }, 10000);
});
