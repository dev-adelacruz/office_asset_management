# frozen_string_literal: true

require 'rails_helper'
require './spec/support/shared_examples/blueprints/blueprint'

RSpec.describe UserBlueprint do
  describe '#render' do
    let(:record) { create(:user) }

    it_behaves_like 'a blueprint' do
      let(:expected_keys) { %i[email id role name phone_number office_location avatar_url] }
    end
  end
end
