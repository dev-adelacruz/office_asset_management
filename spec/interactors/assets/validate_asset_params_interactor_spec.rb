# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::ValidateAssetParamsInteractor do
  subject(:result) { described_class.call(context_params) }

  let(:valid_params) { attributes_for(:asset) }

  describe "with valid params and no existing asset (create path)" do
    let(:context_params) { { asset_params: valid_params } }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "with valid params and an existing asset (update path)" do
    let(:asset) { create(:asset) }
    let(:context_params) { { asset: asset, asset_params: { name: "Updated Name" } } }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "with missing required fields" do
    let(:context_params) { { asset_params: { name: "" } } }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a validation message" do
      expect(result.message).to be_present
    end
  end

  describe "with invalid enum value" do
    let(:context_params) { { asset_params: valid_params.merge(category: "invalid_category") } }

    it "fails the context" do
      expect(result).to be_failure
    end
  end
end
