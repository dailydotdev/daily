import classNames from 'classnames';
import type { MutableRefObject, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAtomValue } from 'jotai';
import type {
  AuthTriggersType,
  RegistrationError,
  RegistrationParameters,
} from '../../lib/auth';
import { AuthEventNames, AuthTriggers } from '../../lib/auth';
import { formToJson } from '../../lib/form';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { PasswordField } from '../fields/PasswordField';
import { TextField } from '../fields/TextField';
import {
  MailIcon,
  UserIcon,
  VIcon,
  AtIcon,
  ArrowIcon,
  BriefIcon,
  JobIcon,
} from '../icons';
import type { CloseModalFunc } from '../modals/common';
import TokenInput from './TokenField';
import AuthForm from './AuthForm';
import AuthHeader from './AuthHeader';
import SignupDisclaimer from './SignupDisclaimer';
import { Checkbox } from '../fields/Checkbox';
import { useLogContext } from '../../contexts/LogContext';
import { useGenerateUsername, useCheckExistingEmail } from '../../hooks';
import type { AuthFormProps } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import AuthContainer from './AuthContainer';
import { onValidateHandles } from '../../hooks/useProfileForm';
import ExperienceLevelDropdown from '../profile/ExperienceLevelDropdown';
import CloudProviderDropdown from '../profile/CloudProviderDropdown';
import type { ProfileExtraField } from '../../lib/user';
import Alert, { AlertType, AlertParagraph } from '../widgets/Alert';
import { isDevelopment, isProductionAPI } from '../../lib/constants';
import { onboardingGradientClasses } from '../onboarding/common';
import { useAuthData } from '../../contexts/AuthDataContext';
import { authAtom } from '../../features/onboarding/store/onboarding.store';
import { FunnelTargetId } from '../../features/onboarding/types/funnelEvents';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '../../features/onboarding/shared/FunnelGlassBar';
import { Loader } from '../Loader';
import { labels } from '../../lib';

export interface RegistrationFormProps extends AuthFormProps {
  formRef?: MutableRefObject<HTMLFormElement>;
  onBack?: CloseModalFunc;
  hints?: RegistrationError;
  onUpdateHints?: (errors: RegistrationError) => void;
  onSignup?: (params: RegistrationFormValues) => void;
  token?: string;
  trigger: AuthTriggersType;
  onExistingEmailLoginClick?: () => void;
  onBackToIntro?: () => void;
  targetId?: string;
  // Header title above the form. Defaults to "Sign up" because this form is
  // exclusively reached via the signup flow; left overridable so the same
  // component can reflect a login-style title if a flow ever needs it.
  headerTitle?: string;
  // Optional extra profile fields to collect at signup, driven by the
  // onboarding funnel (campaign cohorts). Empty/undefined = default fields.
  extraFields?: ProfileExtraField[];
  // Whether to render the "The homepage developers deserve" headline above the
  // form. The onboarding funnel already shows this copy on the signup wall, so
  // it hides it here to avoid duplicating the message on the email step.
  showHeadline?: boolean;
  // Post-signup onboarding only: the funnel's headline scale, and the glass bar
  // around Sign up, so this screen matches the steps after it.
  isOnboardingFunnel?: boolean;
}

export type RegistrationFormValues = Omit<
  RegistrationParameters,
  'method' | 'provider'
> & {
  'cf-turnstile-response'?: string;
  headers?: Record<string, string>;
};

const RegistrationForm = ({
  formRef,
  onBackToIntro,
  onExistingEmailLoginClick,
  onSignup = () => undefined,
  token,
  hints = {},
  trigger,
  onUpdateHints = () => undefined,
  simplified,
  targetId,
  headerTitle = 'Sign up',
  extraFields = [],
  showHeadline = true,
  isOnboardingFunnel,
}: RegistrationFormProps): ReactElement => {
  const { email } = useAuthData();
  const { logEvent } = useLogContext();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<boolean>(false);
  const [turnstileLoaded, setTurnstileLoaded] = useState<boolean>(false);
  const [turnstileErrorLoading, setTurnstileErrorLoading] =
    useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [name, setName] = useState('');
  const isRecruiterOnboarding = trigger === AuthTriggers.RecruiterSelfServe;
  const hideExperienceLevel = isRecruiterOnboarding;
  const {
    username,
    setUsername,
    isLoading: isLoadingUsername,
  } = useGenerateUsername(name);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const prevHintsRef = useRef<RegistrationError>(hints);

  const logRef = useRef(logEvent);
  logRef.current = logEvent;

  useEffect(() => {
    logRef.current({
      event_name: AuthEventNames.StartSignUpForm,
    });
  }, []);

  useEffect(() => {
    const hasActiveErrors = Object.values(hints).some((val) =>
      Boolean(val?.length),
    );

    if (hasActiveErrors && hints !== prevHintsRef.current) {
      logRef.current({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({ error: hints }),
      });
      if (hints?.csrf_token) {
        setTurnstileError(true);
      }
      setTurnstileToken(null);
      turnstileRef?.current?.reset();
    }
    prevHintsRef.current = hints;
  }, [hints]);

  useEffect(() => {
    if (turnstileLoaded) {
      return () => {};
    }

    const turnstileLoadTimeout = setTimeout(() => {
      if (!turnstileLoaded) {
        logRef.current({
          event_name: AuthEventNames.TurnstileLoadError,
        });
        setTurnstileErrorLoading(true);
      }
    }, 5000);

    return () => clearTimeout(turnstileLoadTimeout);
  }, [turnstileLoaded]);

  const {
    email: { isCheckPending, alreadyExists },
    onEmailCheck,
  } = useCheckExistingEmail({
    onValidEmail: () => null,
    onAfterEmailCheck: (emailExists) => {
      if (emailExists) {
        logRef.current({
          event_name: AuthEventNames.OpenLogin,
          extra: JSON.stringify({ trigger }),
          target_id: targetId,
        });
      }
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCheckPending || alreadyExists) {
      return;
    }

    setTurnstileError(false);
    logRef.current({
      event_name: AuthEventNames.SubmitSignUpForm,
    });

    setIsSubmitted(true);
    const form = e.target as HTMLFormElement;
    const { optOutMarketing, ...values } = formToJson<RegistrationFormValues>(
      formRef?.current ?? form,
    );
    delete values['cf-turnstile-response'];

    const requiresExperienceLevel = !hideExperienceLevel;
    // Cloud provider is mandatory only when the funnel requests it (the
    // campaign flow); company/job title stay optional.
    const requiresCloudProvider = extraFields.includes('cloudProvider');
    if (
      !values['traits.name']?.length ||
      !values['traits.username']?.length ||
      (requiresExperienceLevel && !values['traits.experienceLevel']?.length) ||
      (requiresCloudProvider && !values['traits.cloudProvider']?.length)
    ) {
      const setHints = { ...hints };

      if (!values['traits.name']?.length) {
        setHints['traits.name'] = 'Please provide name.';
      }
      if (!values['traits.username']?.length) {
        setHints['traits.username'] = 'Please provide username.';
      }
      if (
        requiresExperienceLevel &&
        !values['traits.experienceLevel']?.length
      ) {
        setHints['traits.experienceLevel'] = 'Please provide experience level.';
      }
      if (requiresCloudProvider && !values['traits.cloudProvider']?.length) {
        setHints['traits.cloudProvider'] =
          'Please provide your cloud provider.';
      }

      onUpdateHints(setHints);
      return;
    }

    const turnstileResponse =
      turnstileToken || turnstileRef.current?.getResponse();

    if (!turnstileResponse) {
      logRef.current({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({
          error: 'Turnstile not valid',
        }),
      });
      setTurnstileError(true);
      return;
    }

    const error = onValidateHandles(
      {},
      {
        username: values['traits.username'],
      },
    );

    if (error.username) {
      const updatedHints = { ...hints };

      if (error.username) {
        updatedHints['traits.username'] = error.username;
      }

      onUpdateHints(updatedHints);
      return;
    }

    let headers: Record<string, string> | undefined;
    if (!(isDevelopment && !isProductionAPI) && turnstileResponse) {
      headers = { 'True-Client-Ip': turnstileResponse };
    }

    onSignup({
      ...values,
      'traits.acceptedMarketing': !optOutMarketing,
      // Set experience level to "not an engineer" for recruiters
      ...(isRecruiterOnboarding && {
        'traits.experienceLevel': 'NOT_ENGINEER',
      }),
      ...(headers && { headers }),
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    const emailCheck = await onEmailCheck(e);
    if (!!emailCheck && emailCheck.emailValue && !emailCheck.emailExists) {
      onSubmit(e);
    }
  };

  const isNameValid = !hints?.['traits.name'];
  const isUsernameValid = !hints?.['traits.username'];
  const isExperienceLevelValid =
    !isSubmitted || !hints?.['traits.experienceLevel'];
  const isCloudProviderValid = !isSubmitted || !hints?.['traits.cloudProvider'];
  const { isAuthenticating = false } = useAtomValue(authAtom);

  // Only show the valid-state checkmark once the user has actually typed
  // a non-empty value; an untouched field shouldn't look like it passed
  // validation.
  const isEmailFilled = !!email?.length;
  const isNameFilled = !!name?.length;
  const isUsernameFilled = !!username?.length;
  const successIcon = (
    <VIcon
      aria-hidden
      role="presentation"
      className="text-accent-avocado-default"
    />
  );

  const usernameIcon = (() => {
    if (isLoadingUsername) {
      return <Loader />;
    }

    if (isUsernameFilled && isUsernameValid) {
      return successIcon;
    }

    return undefined;
  })();

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_KEY ?? '';

  return (
    <div className="flex flex-col">
      {!isAuthenticating && (
        <AuthHeader
          simplified={simplified}
          onboardingHeadline={isOnboardingFunnel}
          title={headerTitle}
        />
      )}
      <div
        className={classNames(
          // `simplified` is set by `/onboarding`, where the outer page already
          // applies horizontal padding. Anywhere else (e.g. the inline AuthModal)
          // the form would otherwise hug the container edge, so add it here.
          !simplified && 'px-4 pb-4 tablet:px-6',
        )}
      >
        {!isAuthenticating && (onBackToIntro || showHeadline) && (
          <div className="flex items-start gap-4 pt-2">
            {onBackToIntro && (
              <Button
                className="border-border-subtlest-tertiary text-text-secondary"
                data-funnel-track={FunnelTargetId.StepBack}
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={onBackToIntro}
                size={ButtonSize.Medium}
                type="button"
                variant={ButtonVariant.Secondary}
              />
            )}
            {showHeadline && (
              <h1 className="mx-auto mt-4 flex-1 font-bold leading-[1.3] tracking-tight typo-title1 tablet:leading-[1.22] tablet:typo-large-title">
                <span
                  className={classNames(
                    onboardingGradientClasses,
                    'text-text-primary',
                  )}
                >
                  Where developers discover what&apos;s next
                </span>
              </h1>
            )}
          </div>
        )}
        <AuthForm
          className={classNames(
            'mt-10 w-full flex-1 place-items-center gap-2 self-center overflow-y-auto pb-2',
          )}
          data-testid="registration_form"
          id="auth-form"
          onSubmit={handleFormSubmit}
          ref={formRef}
        >
          {token && <TokenInput token={token} />}
          <TextField
            autoFocus
            autoComplete="email"
            saveHintSpace
            className={{ container: 'w-full' }}
            leftIcon={<MailIcon aria-hidden role="presentation" />}
            name="traits.email"
            inputId="email"
            label="Email"
            type="email"
            value={email}
            rightIcon={isEmailFilled ? successIcon : undefined}
          />
          {hints?.['traits.email'] && !alreadyExists && (
            <Alert
              className="-mt-4 mb-3 min-w-full"
              type={AlertType.Error}
              title={hints['traits.email']}
            />
          )}
          {alreadyExists && (
            <Alert
              className="-mt-4 mb-3 min-w-full"
              type={AlertType.Error}
              flexDirection="flex-row"
            >
              <AlertParagraph className="!mt-0 flex-1">
                Email is taken. Existing user?{' '}
                <button
                  type="button"
                  onClick={() => onExistingEmailLoginClick?.()}
                  className="font-bold underline"
                >
                  Log in.
                </button>
              </AlertParagraph>
            </Alert>
          )}
          <TextField
            autoComplete="name"
            saveHintSpace
            className={{ container: 'w-full' }}
            valid={isNameValid}
            leftIcon={<UserIcon aria-hidden role="presentation" />}
            name="traits.name"
            inputId="traits.name"
            label="Name"
            hint={hints?.['traits.name']}
            value={name}
            onBlur={(e) => setName(e.target.value)}
            valueChanged={() =>
              hints?.['traits.name'] &&
              onUpdateHints({ ...hints, 'traits.name': '' })
            }
            rightIcon={isNameFilled && isNameValid ? successIcon : undefined}
          />
          <PasswordField
            required
            minLength={6}
            maxLength={72}
            saveHintSpace
            className={{ container: 'w-full' }}
            name="password"
            inputId="password"
            label="Create a password"
            autoComplete="new-password"
          />
          <TextField
            autoComplete="user"
            saveHintSpace
            className={{ container: 'w-full' }}
            valid={isLoadingUsername || isUsernameValid}
            leftIcon={<AtIcon aria-hidden role="presentation" />}
            name="traits.username"
            inputId="traits.username"
            label="Enter a username"
            value={username}
            onBlur={(e) => setUsername(e.target.value)}
            hint={
              isLoadingUsername
                ? labels.generatingUsername
                : hints?.['traits.username']
            }
            valueChanged={() =>
              hints?.['traits.username'] &&
              onUpdateHints({ ...hints, 'traits.username': '' })
            }
            rightIcon={usernameIcon}
          />
          {!hideExperienceLevel && (
            <ExperienceLevelDropdown
              className={{ container: 'w-full' }}
              name="traits.experienceLevel"
              valid={isExperienceLevelValid}
              hint={hints?.['traits.experienceLevel']}
              onChange={() =>
                hints?.['traits.experienceLevel'] &&
                onUpdateHints({ ...hints, 'traits.experienceLevel': '' })
              }
              saveHintSpace
            />
          )}
          {extraFields.includes('company') && (
            <TextField
              autoComplete="organization"
              saveHintSpace
              className={{ container: 'w-full' }}
              leftIcon={<BriefIcon aria-hidden role="presentation" />}
              name="traits.company"
              inputId="traits.company"
              label="Company name"
            />
          )}
          {extraFields.includes('jobTitle') && (
            <TextField
              autoComplete="organization-title"
              saveHintSpace
              className={{ container: 'w-full' }}
              leftIcon={<JobIcon aria-hidden role="presentation" />}
              name="traits.title"
              inputId="traits.title"
              label="Job title"
            />
          )}
          {extraFields.includes('cloudProvider') && (
            <CloudProviderDropdown
              className={{ container: 'w-full' }}
              name="traits.cloudProvider"
              valid={isCloudProviderValid}
              hint={hints?.['traits.cloudProvider']}
              onChange={() =>
                hints?.['traits.cloudProvider'] &&
                onUpdateHints({ ...hints, 'traits.cloudProvider': '' })
              }
              saveHintSpace
            />
          )}
          <Checkbox className="w-full" name="optOutMarketing">
            I don&apos;t want to receive updates and promotions via email
          </Checkbox>
          <ConditionalWrapper
            condition={simplified ?? false}
            wrapper={(component) => (
              <AuthContainer className="!mt-0 !px-0 pb-1 pt-3">
                {component}
              </AuthContainer>
            )}
          >
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              options={{
                theme: 'dark',
                // Run the challenge silently and only surface the widget when a
                // human interaction is actually required, so the branded box
                // doesn't clash with the form for the common (passing) case.
                appearance: 'interaction-only',
              }}
              className="mx-auto"
              onWidgetLoad={() => setTurnstileLoaded(true)}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setTurnstileError(false);
              }}
              onError={() => {
                setTurnstileToken(null);
                setTurnstileError(true);
              }}
              onExpire={() => {
                setTurnstileToken(null);
                turnstileRef?.current?.reset();
              }}
            />
            {turnstileError && (
              <Alert
                type={AlertType.Error}
                title="Please complete the security check."
              />
            )}
            {turnstileErrorLoading && (
              <Alert
                type={AlertType.Error}
                title="Turnstile is taking too long to load. Please try again."
              />
            )}
            {/* The funnel's primary action always sits inside the glass bar, so
                account details matches the seven steps behind it rather than
                ending on a bare button. Medium + flex-1 keeps the nested radii
                concentric; every other surface keeps the full-width Large. */}
            <ConditionalWrapper
              condition={!!isOnboardingFunnel}
              wrapper={(component) => (
                <FunnelGlassBar>{component}</FunnelGlassBar>
              )}
            >
              <Button
                className={isOnboardingFunnel ? funnelGlassBarCta : 'w-full'}
                data-funnel-track={FunnelTargetId.StepCta}
                disabled={isCheckPending || !turnstileLoaded}
                form="auth-form"
                size={isOnboardingFunnel ? ButtonSize.Medium : ButtonSize.Large}
                type="submit"
                variant={ButtonVariant.Primary}
              >
                Sign up
              </Button>
            </ConditionalWrapper>
            {/* Consent belongs to the button that creates the account, so it
                travels with this form instead of being docked on the funnel
                shell — that shell also serves sign-back, login and
                verify-email, where the account already exists. The funnel's
                signup wall suppresses its own inline copy, which makes this the
                notice shown before the account is created, at every width. */}
            {isOnboardingFunnel && (
              <SignupDisclaimer className="!text-text-tertiary typo-caption1" />
            )}
          </ConditionalWrapper>
        </AuthForm>
      </div>
    </div>
  );
};

export default RegistrationForm;
