# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::CreateAssetUsecase do
  subject(:result) { described_class.call(asset_params: asset_params) }

  describe "happy path" do
    let(:asset_params) { attributes_for(:asset) }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates an Asset record" do
      expect { result }.to change(Asset, :count).by(1)
    end

    it "returns the created asset on context" do
      expect(result.asset).to be_a(Asset)
      expect(result.asset).to be_persisted
    end
  end

  describe "mid-chain failure — validation fails before persistence" do
    let(:asset_params) { attributes_for(:asset, name: "") }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — does not create any Asset record" do
      expect { result }.not_to change(Asset, :count)
    end
  end
end
