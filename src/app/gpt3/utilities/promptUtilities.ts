export class PromptUtilities {
    headlinePromptV1 : string = '##NUMOF## creative headlines for an SEO friendly article with the following keyword "##KEYWORD1##"'
    headlinePromptV1Extend: string = 'and should also include the word "##KEYWORD##"'
    introSummaryPrompt: string = 'The following are 5 creative introductions for an SEO friendly article with the headline "##HEADLINE##" and description "##DESCRIPTION##" Each introduction should contain at least 30 words \n Introduction #1:'
}

export class optionObject {
    text: string = ''
    checked: boolean = false
}