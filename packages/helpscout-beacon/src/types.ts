/* eslint-disable @typescript-eslint/no-explicit-any */

export type WeakBeacon = ((method: any, options?: any, data?: any) => void) &
  Record<string, any>

export interface BeaconConfigLabels {
  // General
  answer: string
  ask: string
  beaconButtonChatMinimize: string
  beaconButtonChatOpen: string
  defaultMessageErrorText: string
  beaconButtonClose: string
  beaconButtonBack: string

  // Answers
  suggestedForYou: string
  getInTouch: string
  searchLabel: string
  tryAgain: string

  // Ask
  messageButtonLabel: string
  noTimeToWaitAround: string
  chatButtonLabel: string
  chatButtonDescription: string
  wereHereToHelp: string
  whatMethodWorks: string
  previousMessages: string

  // Search Results
  cantFindAnswer: string
  relatedArticles: string
  // Response Text
  nothingFound: string
  docsSearchEmptyText: string
  tryBroaderTerm: string
  docsArticleErrorText: string
  docsSearchErrorText: string
  // Escalation
  escalationSearchText: string
  escalationSearchTitle: string
  escalationTalkText: string
  escalationTalkTitle: string
  escalationQuestionFeedback: string
  escalationQuestionFeedbackYes: string
  escalationQuestionFeedbackNo: string
  escalationThanksFeedback: string
  escalationWhatNext: string

  // Send a Message
  sendAMessage: string
  howCanWeHelp: string
  firstAFewQuestions: string
  responseTime: string
  history: string
  continueEditing: string
  lastUpdated: string
  you: string
  // Contact Form
  nameLabel: string
  subjectLabel: string
  emailLabel: string
  messageLabel: string
  messageSubmitLabel: string
  next: string
  // Response Text
  weAreOnIt: string
  messageConfirmationText: string
  viewAndUpdateMessage: string
  mayNotBeEmpty: string
  emailValidationLabel: string
  attachmentErrorText: string
  attachmentSizeErrorText: string
  customFieldsValidationLabel: string
  attachAFile: string
  uploadAnImage: string

  // Previous Messages
  addReply: string
  addYourMessageHere: string
  sendMessage: string
  received: string
  waitingForAnAnswer: string
  previousMessageErrorText: string
  justNow: string

  // Chat
  chatHeadingTitle: string
  chatHeadingSublabel: string
  chatEndCalloutHeading: string
  chatEndCalloutMessage: string
  chatEndCalloutLink: string
  chatEndUnassignedCalloutHeading: string
  chatEndUnassignedCalloutMessage: string
  chatEndWaitingCustomerHeading: string
  chatEndWaitingCustomerMessage: string
  ending: string
  endChat: string
  chatEnded: string
  chatConnected: string
  chatbotName: string
  chatbotGreet: string
  chatbotPromptEmail: string
  chatbotConfirmationMessage: string
  chatbotGenericErrorMessage: string
  chatbotInactivityPrompt: string
  chatbotInvalidEmailMessage: string
  chatbotAgentDisconnectedMessage: string
  chatAvailabilityChangeMessage: string
  // Transcript Email
  emailSubject: string
  emailHeading: string
  emailGreeting: string
  emailCopyOfDiscussion: string
  emailContinueConversation: string
  emailJoinedLineItem: string
  emailEndedLineItem: string
  emailYou: string
}

export interface BeaconConfigOptions {
  /** Enable or disable the Docs integration. This can only be enabled via the JS API if it is already enabled in the Beacon settings. */
  docsEnabled?: boolean

  /** Enable or disable the contact options. This can only be enabled via the JS API if it is already enabled in the Beacon settings. */
  messagingEnabled?: boolean

  /** Enable or disable the pulse animation shown when Beacon first loads. */
  enableFabAnimation?: boolean

  /** Enable or disable Previous Messages in Beacon. Defaults to true. */
  enablePreviousMessages?: boolean

  /** Brand color for your Beacon */
  color?: string

  /** If your Beacon has Docs and Messaging (email or chat) enabled, the mode controls the user experience of the Beacon. */
  mode?: 'selfService' | 'neutral' | 'askFirst'

  /** Hides User avatars in the Beacon embed until a customer starts a live chat. */
  hideAvatars?: boolean

  /** Enable or disable the Beacon button on mobile. */
  hideFABOnMobile?: boolean

  /** Enable or disable the Beacon button text on mobile. */
  hideFABLabelOnMobile?: boolean

  display?: {
    /** Style of the button being used to toggle the Beacon */
    style?: 'icon' | 'text' | 'iconAndText' | 'manual'

    /** Customize the text in your Beacon button, if you have the `text` or `iconAndText` style enabled */
    text?: string

    /** Put the text on the left or right of the icon, if using the `iconAndText` style */
    textAlign?: 'left' | 'right'

    /** Customize the icon shown in your Beacon, if you have the `icon` or `iconAndText` style enabled */
    iconImage?: 'message' | 'beacon' | 'search' | 'buoy' | 'question'

    /** Puts your Beacon on the bottom left or bottom right of the page */
    position?: 'left' | 'right'

    /** Update this to change the default `z-index` of the Beacon */
    zIndex?: number
  }

  messaging?: {
    /** Enable or disable Chat. This can only be enabled via the JS API if it is already enabled in the Beacon settings. */
    chatEnabled?: boolean

    contactForm?: {
      /** Enable or disable Custom Fields. This can only be enabled via the JS API if it is already enabled in the Beacon settings. */
      customFieldsEnabled?: boolean

      /** Display an editable Name field. This can only be set from `false` to `true` as otherwise the field would still be required. */
      showName?: boolean

      /** Display an editable Subject field. This can only be set from `false` to `true` as otherwise the field would still be required. */
      showSubject?: boolean

      /** Enable or disable file attachments. This can only be enabled via the JS API if it is already enabled in the Beacon settings. */
      allowAttachments?: boolean

      /** Show a contact link on the Beacon home screen */
      showGetInTouch?: boolean
    }

    /** When custom field values are pre-filled, set to true to make them visible */
    showPrefilledCustomFields?: boolean
  }

  labels?: BeaconConfigLabels
}

export interface BeaconEvents {
  /**	Triggered when the Beacon is opened */
  open: (callback: () => void) => void

  /**	Triggered when the Beacon is closed */
  close: (callback: () => void) => void

  /** Triggered when the Beacon finishes loading on the page */
  ready: (callback: () => void) => void

  /** Triggered when a Docs Article is opened in Beacon	*/
  articleViewed: (callback: (id: string) => void) => void

  /** Triggered when a Chat is started via Beacon	*/
  chatStarted: (
    callback: (name: string, email: string, subject: string) => void,
  ) => void

  /** Triggered when a message is sent via Beacon	*/
  emailSent: (
    callback: (name: string, email: string, text: string) => void,
  ) => void

  /** Triggered when a Docs search is performed via Beacon */
  search: (callback: (query: string) => void) => void
}

export interface Beacon {
  /**
   * Call this method to load the Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconinit-beaconid
   */
  (method: 'init', beaconId: string): void

  /**
   * Unmounts the Beacon from the DOM. You can call init again to re-render it.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacondestroy
   */
  (method: 'destroy'): void

  /**
   * Manually open the Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconopenclose
   */
  (method: 'open'): void

  /** Manually close the Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconopenclose
   */
  (method: 'close'): void

  /** Manually toggle open/close the Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconopenclose
   */
  (method: 'toggle'): void

  /**
   * Searches Docs articles and loads the results screen.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconsearch-query
   */
  (method: 'search', query: string): void

  /**
   * Suggest Docs articles or custom URLs. You can include a maximum of ten (10) Article suggestions in the suggest method.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconsuggest
   */
  (
    method: 'suggest',
    articleIds: (string | { text: string; url: string })[],
  ): void

  /**
   * Open the Article within Beacon, or in a sidebar or modal.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconarticle
   */
  (
    method: 'article',
    articleId: string,
    options?: { type: 'sidebar' | 'modal' },
  ): void

  /**
   * Navigates to a specific screen.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconnavigate-route
   */
  (
    method: 'navigate',
    route:
      | '/'
      | '/ask/'
      | '/ask/message/'
      | '/ask/chat/'
      | '/answers/'
      | '/previous-messages/'
      | '/docs/search?query=help',
  ): void

  /**
   * It creates a new customer profile for each visitor that opens your Beacon. If a customer profile already exists, it will update the existing profile for that visitor.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconidentify-userobject
   */
  (
    method: 'identify',
    userObject: {
      name?: string
      email?: string
      jobTitle?: string
      avatar?: string
      signature?: string
      [customAttribute: string]: string | number | null | undefined
    },
  ): void

  /**
   * This method can be used to pre-populate the “Create a message” contact form with data.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconprefill-formobject
   */
  (
    method: 'prefill',
    formObject: {
      name?: string
      email?: string
      subject?: string
      text?: string
      fields?: { id: string; value: string | number }[]
    },
  ): void

  /**
   * Resets the contact form by clearing all of its fields, custom fields and attachments.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconreset
   */
  (method: 'reset'): void

  /**
   * Clears all data from the Beacon, including: Identify data, Device ID, Conversation history.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconlogout
   */
  (method: 'logout', options?: { endActiveChat: boolean }): void

  /**
   * Allows you to programmatically customize and transform Beacon in a multitude of different ways.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beaconconfig-formobject
   */
  (method: 'config', configObject: BeaconConfigOptions): void

  /**
   * Triggered when the Beacon is opened, `open`, closed `close`, finishes loading on the page `ready`.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacononoffonce
   */
  (
    method: 'on' | 'once' | 'off',
    event: 'open' | 'close' | 'ready',
    callback: () => void,
  ): void

  /**
   * Triggered when a Docs Article is opened in Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacononoffonce
   */
  (
    method: 'on' | 'once' | 'off',
    event: 'article-viewed',
    callback: (id: string) => void,
  ): void

  /**
   * Triggered when a Chat is started via Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacononoffonce
   */
  (
    method: 'on' | 'once' | 'off',
    event: 'chat-started',
    callback: (name: string, email: string, subject: string) => void,
  ): void

  /**
   * Triggered when a message is sent via Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacononoffonce
   */
  (
    method: 'on' | 'once' | 'off',
    event: 'email-sent',
    callback: (name: string, email: string, text: string) => void,
  ): void

  /**
   * Triggered when a Message’s CTA is clicked `message-clicked`, close button is clicked `message-closed`, is shown `message-triggered`.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacononoffonce
   */
  (
    method: 'on' | 'once' | 'off',
    event: 'message-clicked' | 'message-closed' | 'message-triggered',
    callback: (id: string) => void,
  ): void

  /**
   * Triggered when a Docs search is performed via Beacon.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacononoffonce
   */
  (
    method: 'on' | 'once' | 'off',
    event: 'search',
    callback: (query: string) => void,
  ): void

  /**
   * This method can be used to “trigger” specific events in Beacon. At the moment this method only supports a single type of event.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacon-event-eventobject
   */
  (
    method: 'event',
    eventObject: { type: 'page-viewed'; url: string; title: string },
  ): void

  /**
   * Allows you to add session-specific information to a new chat or message.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacon-session-data
   */
  (method: 'sesion-data', data: Record<string, string | number>): void

  /**
   * Allows you to modify when Messages are displayed.
   * https://developer.helpscout.com/beacon-2/web/javascript-api/#beacon-show-message
   */
  (
    method: 'show-message',
    messageId: string,
    options?: { delay?: number; force: boolean },
  ): void
}
