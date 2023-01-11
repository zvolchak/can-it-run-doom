export const bounty = {
  howToAddItem: {
    title: 'How to add bounty?',
    description: 'To add a new bounty, please email the following information to',
    instructions: [
      'Name of the hardware to run the doom at.',
      'Describe the platform/device to run the doom at and/or leave a link to any source describing the platform/device.',
      '(optional) Version of Doom to run other than Classic Doom (e.g. brutal doom, doom 2...).',
      '(optional) Link to an image or attach an image to an email to use as a preview for the bounty.',
      '(optional) Your name/handle to use for this bounty.',
    ],
    orGithub: "<b>Or</b>, if you are familiar with Github, you can submit a PR request with new entries for <a class='doom-text-shadow-danger doom-color-secondary' href='{0}' target='blank'>bounty.json</a> file.",
  },
  howToClaim: {
    title: 'Claim Bounty',
    description: 'If you\'d like to claim this bounty for yourself or on behalf of someone else, please, send an email with the following content to',
    includeId: 'Include ID [{0}] of the bounty you are trying to claim.',
    instructions: [
        'Name(s) to be displayed as Author(s) for this bounty.',
        'Link to a video of running game on the claimed device/platform.',
        '(optional) Link to a source code if you have it publicly available.'
    ],
  }
}
