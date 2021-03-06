import React, { ReactElement } from 'react';

import { FormattedMessage } from 'react-intl-next';

import Avatar from '@atlaskit/avatar';
import Button from '@atlaskit/button/custom-theme-button';
import Lozenge from '@atlaskit/lozenge';
import Spinner from '@atlaskit/spinner';
import { N0 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

import { AnalyticsName } from '../../internal/analytics';
import relativeDate from '../../internal/relative-date';
import messages from '../../messages';
import {
  ActionButtonGroup,
  ActionsFlexSpacer,
  AnimatedKudosButton,
  AppTitleLabel,
  CardContainer,
  CardContent,
  CardWrapper,
  CustomLozengeContainer,
  DetailsGroup,
  DisabledInfo,
  FullNameLabel,
  JobTitleLabel,
  KudosBlobAnimation,
  LozengeWrapper,
  ProfileImage,
  SpinnerContainer,
} from '../../styled/Card';
import { LozengeProps, ProfileCardAction, ProfilecardProps } from '../../types';
import { isBasicClick } from '../../util/click';
import { ErrorMessage } from '../Error';
import { IconLabel } from '../Icon';

import { OverflowProfileCardButtons } from './OverflowProfileCardButtons';
import ReportingLinesDetails from './ReportingLinesDetails';

export default class Profilecard extends React.PureComponent<ProfilecardProps> {
  static defaultProps: ProfilecardProps = {
    isLoading: false,
    hasError: false,
    errorType: null,
    status: 'active',
    isBot: false,
    isNotMentionable: false,
    actions: [],
    hasDisabledAccountLozenge: true,
    customLozenges: [],
    analytics: () => null,
    clientFetchProfile: () => null,
  };

  GIVE_KUDOS_ACTION_ID = 'give-kudos';
  private timeOpen: number | null;
  clientFetchProfile: () => void;

  constructor(props: ProfilecardProps) {
    super(props);

    this.timeOpen = null;

    this.clientFetchProfile = (...args: any) => {
      this.callAnalytics(AnalyticsName.PROFILE_CARD_RELOAD, {});
      this.callClientFetchProfile(...args);
    };
  }

  private durationSince = (from: number | null) => {
    const fromParsed = from || 0;
    return fromParsed > 0 ? Date.now() - fromParsed : null;
  };

  callClientFetchProfile = (...args: any) => {
    if (this.props.clientFetchProfile) {
      this.props.clientFetchProfile(...args);
    }
  };

  callAnalytics = (id: string, options: any) => {
    if (this.props.analytics) {
      this.props.analytics(id, options);
    }
  };

  componentDidMount() {
    this.timeOpen = Date.now();
    this.callAnalytics(AnalyticsName.PROFILE_CARD_VIEW, {});
  }

  renderErrorMessage() {
    return (
      <ErrorMessage
        reload={this.props.clientFetchProfile && this.clientFetchProfile}
        errorType={this.props.errorType}
      />
    );
  }

  kudosUrl = (): string => {
    const recipientId =
      (this.props.userId && `&recipientId=${this.props.userId}`) || '';
    const cloudId =
      (this.props.cloudId && `&cloudId=${this.props.cloudId}`) || '';

    return `${this.props.teamCentralBaseUrl}/kudos/give?type=individual${recipientId}${cloudId}`;
  };

  kudosButtonCallback = () => {
    if (this.props.openKudosDrawer) {
      this.props.openKudosDrawer();
    } else {
      window.open(this.kudosUrl());
    }
  };

  getActions() {
    const actions = this.props.actions || [];
    if (!this.props.isCurrentUser && this.props.isKudosEnabled) {
      const kudosAction = {
        label: <FormattedMessage {...messages.giveKudosButton} />,
        id: this.GIVE_KUDOS_ACTION_ID,
        callback: () => {
          this.kudosButtonCallback();
        },
        link: this.kudosUrl(),
      };
      return actions.concat([kudosAction]);
    }
    return actions;
  }

  renderButton = (action: ProfileCardAction, idx: number): ReactElement => {
    const isGiveKudosActionButton = action.id === this.GIVE_KUDOS_ACTION_ID;

    const actionButton = (
      <Button
        appearance="default"
        key={action.id || idx}
        onClick={(event: React.MouseEvent<HTMLElement>, ...args: any) =>
          this.onActionClick(action, args, event)
        }
        href={action.link}
      >
        {action.label}
        {isGiveKudosActionButton && <KudosBlobAnimation />}
      </Button>
    );

    if (isGiveKudosActionButton) {
      return <AnimatedKudosButton>{actionButton}</AnimatedKudosButton>;
    }
    return actionButton;
  };

  renderActionsButtons() {
    if (this.props.actions && this.props.actions.length === 0) {
      return null;
    }
    const actions = this.getActions();
    const firstTwoActions = actions.slice(0, 2);
    const restOfActions =
      actions && actions.length > 2 ? actions.slice(2) : undefined;

    return (
      <ActionButtonGroup>
        {firstTwoActions.map((action, idx: number) =>
          this.renderButton(action, idx),
        )}
        {restOfActions && (
          <OverflowProfileCardButtons
            actions={restOfActions}
            onItemClick={(action, args, event) =>
              this.onActionClick(action, args, event)
            }
          />
        )}
      </ActionButtonGroup>
    );
  }

  private onActionClick(
    action: ProfileCardAction,
    args: any,
    event: React.MouseEvent | React.KeyboardEvent,
  ) {
    this.callAnalytics(AnalyticsName.PROFILE_CARD_CLICK, {
      id: action.id || null,
      duration: this.durationSince(this.timeOpen),
    });

    if (action.callback && isBasicClick(event)) {
      event.preventDefault();
      action.callback(event, ...args);
    }
  }

  renderCardDetailsDefault() {
    const {
      meta,
      location,
      email,
      timestring,
      companyName,
      customLozenges,
    } = this.props;

    return (
      <DetailsGroup>
        {this.renderFullNameAndPublicName(meta)}
        {meta && <JobTitleLabel>{meta}</JobTitleLabel>}
        {customLozenges && this.renderCustomLozenges(customLozenges)}
        <IconLabel icon="email">{email}</IconLabel>
        <IconLabel icon="time">{timestring}</IconLabel>
        <IconLabel icon="companyName">{companyName}</IconLabel>
        <IconLabel icon="location">{location}</IconLabel>
        <ReportingLinesDetails
          reportingLines={this.props.reportingLines}
          reportingLinesProfileUrl={this.props.reportingLinesProfileUrl}
          onReportingLinesClick={this.props.onReportingLinesClick}
          analytics={this.props.analytics}
          getDuration={() => this.durationSince(this.timeOpen)}
        />
      </DetailsGroup>
    );
  }

  renderCardDetailsForDisabledAccount() {
    const { status, companyName, hasDisabledAccountLozenge } = this.props;

    return (
      <DetailsGroup>
        <FullNameLabel noMeta isDisabledAccount>
          {this.getDisabledAccountName()}
        </FullNameLabel>

        {hasDisabledAccountLozenge && (
          <LozengeWrapper>
            <Lozenge appearance="default" isBold>
              {status === 'inactive' && (
                <FormattedMessage {...messages.inactiveAccountMsg} />
              )}
              {status === 'closed' && (
                <FormattedMessage {...messages.closedAccountMsg} />
              )}
            </Lozenge>
          </LozengeWrapper>
        )}

        <DisabledInfo>{this.getDisabledAccountDesc()}</DisabledInfo>

        {status === 'inactive' && (
          <IconLabel icon="companyName">{companyName}</IconLabel>
        )}
      </DetailsGroup>
    );
  }

  getDisabledAccountName() {
    const { nickname, fullName, status } = this.props;
    if (status === 'inactive') {
      return fullName || nickname;
    } else if (status === 'closed') {
      return (
        nickname || (
          <FormattedMessage {...messages.disabledAccountDefaultName} />
        )
      );
    }

    return null;
  }

  getDisabledAccountDesc() {
    const {
      status = 'closed',
      statusModifiedDate,
      disabledAccountMessage,
    } = this.props;
    const date = statusModifiedDate
      ? new Date(statusModifiedDate * 1000)
      : null;
    const relativeDateKey = relativeDate(date);

    // consumer does not want to use built-in message
    if (disabledAccountMessage) {
      return disabledAccountMessage;
    }

    let secondSentence: React.ReactNode = null;
    if (relativeDateKey) {
      secondSentence = (
        <FormattedMessage
          // @ts-ignore
          {...messages[`${status}AccountDescMsgHasDate${relativeDateKey}`]}
        />
      );
    } else {
      secondSentence = (
        // @ts-ignore
        <FormattedMessage {...messages[`${status}AccountDescMsgNoDate`]} />
      );
    }

    return (
      <p>
        <FormattedMessage {...messages.generalDescMsgForDisabledUser} />{' '}
        {secondSentence}
      </p>
    );
  }

  private renderFullNameAndPublicName(meta?: string) {
    const { nickname, fullName } = this.props;

    if (!fullName && !nickname) {
      return null;
    }

    const displayName =
      fullName === nickname
        ? fullName
        : `${fullName}${nickname ? ` (${nickname}) ` : ''}`;

    return <FullNameLabel noMeta={!meta}>{displayName}</FullNameLabel>;
  }

  // Pass lozenges as an array rather taking it from the props. This will allow us combine the
  // other lozenges (like the "deactivated" lozenge) if we need to.
  renderCustomLozenges(lozenges: LozengeProps[]) {
    return lozenges.length > 0 ? (
      <CustomLozengeContainer>
        {lozenges.map(({ text, ...otherProps }, index) => (
          <Lozenge {...otherProps} key={index}>
            {text}
          </Lozenge>
        ))}
      </CustomLozengeContainer>
    ) : null;
  }

  renderCardDetailsApp() {
    return (
      <DetailsGroup>
        {this.renderFullNameAndPublicName()}
        <AppTitleLabel>App</AppTitleLabel>
      </DetailsGroup>
    );
  }

  renderCardDetails() {
    const { isBot, status } = this.props;

    if (isBot) {
      return this.renderCardDetailsApp();
    }

    if (status === 'inactive' || status === 'closed') {
      return this.renderCardDetailsForDisabledAccount();
    }

    return this.renderCardDetailsDefault();
  }

  render() {
    const { fullName, status, withoutElevation, reportingLines } = this.props;
    let cardContent: React.ReactNode = null;

    // @FIXME do closed users have empty fullName field?
    const canRender = fullName || status === 'closed';

    if (this.props.hasError) {
      this.callAnalytics(AnalyticsName.PROFILE_CARD_ERROR, {});

      cardContent = this.renderErrorMessage();
    } else if (this.props.isLoading) {
      cardContent = (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      );
    } else if (canRender) {
      const isDisabledUser = status === 'inactive' || status === 'closed';
      const actions = this.renderActionsButtons();

      this.callAnalytics(AnalyticsName.PROFILE_CARD_LOADED, {
        duration: this.durationSince(this.timeOpen),
        managersCount: reportingLines?.managers?.length || 0,
        directReportsCount: reportingLines?.reports?.length || 0,
      });

      cardContent = (
        <CardContainer
          isDisabledUser={isDisabledUser}
          withoutElevation={withoutElevation}
        >
          <ProfileImage>
            <Avatar
              size="xlarge"
              src={
                this.props.status !== 'closed'
                  ? this.props.avatarUrl
                  : undefined
              }
              borderColor={token('elevation.surface.overlay', N0)}
            />
          </ProfileImage>
          <CardContent>
            {this.renderCardDetails()}
            {actions ? (
              <>
                <ActionsFlexSpacer />
                {actions}
              </>
            ) : null}
          </CardContent>
        </CardContainer>
      );
    }

    return <CardWrapper>{cardContent}</CardWrapper>;
  }
}
