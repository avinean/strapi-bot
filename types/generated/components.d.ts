import type { Schema, Struct } from '@strapi/strapi';

export interface PollItems extends Struct.ComponentSchema {
  collectionName: 'components_poll_items';
  info: {
    description: '';
    displayName: 'Item';
  };
  attributes: {
    multipleChoices: Schema.Attribute.Boolean;
    options: Schema.Attribute.Component<'poll.option', true>;
    question: Schema.Attribute.String;
    score: Schema.Attribute.Integer;
  };
}

export interface PollOption extends Struct.ComponentSchema {
  collectionName: 'components_poll_options';
  info: {
    description: '';
    displayName: 'Option';
  };
  attributes: {
    difficultness: Schema.Attribute.Integer;
    isCorrect: Schema.Attribute.Boolean;
    label: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'poll.items': PollItems;
      'poll.option': PollOption;
    }
  }
}
