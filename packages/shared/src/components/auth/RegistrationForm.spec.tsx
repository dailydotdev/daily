import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegistrationForm from './RegistrationForm';
import { AuthTriggers } from '../../lib/auth';

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => <div data-testid="turnstile" />,
}));

jest.mock('./SignupDisclaimer', () => ({
  __esModule: true,
  default: () => <div data-testid="disclaimer" />,
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../../contexts/AuthDataContext', () => ({
  useAuthData: () => ({ email: 'ada@daily.dev' }),
}));

// Stub the two query-backed hooks at their source modules rather than through
// the `hooks` barrel — the barrel re-exports the whole hook surface, and
// replacing it takes out everything else the form's fields pull from it.
jest.mock('../../hooks/onboarding/useGenerateUsername', () => ({
  useGenerateUsername: () => ({
    username: '',
    setUsername: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('../../hooks/onboarding/useCheckExistingEmail', () => ({
  useCheckExistingEmail: () => ({
    email: { isCheckPending: false, alreadyExists: false },
    onEmailCheck: jest.fn(),
  }),
}));

const renderForm = (props = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RegistrationForm
        trigger={AuthTriggers.Onboarding}
        simplified
        {...props}
      />
    </QueryClientProvider>,
  );

describe('RegistrationForm', () => {
  // The consent line lives with the button that creates the account, not on the
  // funnel shell — that shell also serves sign-back, login and verify-email,
  // where the account already exists and the notice would be wrong.
  it('shows the signup disclaimer in the onboarding funnel', () => {
    renderForm({ isOnboardingFunnel: true });

    expect(screen.getByTestId('disclaimer')).toBeInTheDocument();
  });

  it('leaves the disclaimer to the caller everywhere else', () => {
    renderForm();

    expect(screen.queryByTestId('disclaimer')).not.toBeInTheDocument();
  });
});
