# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::SetAssetStatusAvailableInteractor do
  let!(:asset) { create(:asset, status: :assigned) }

  subject(:result) { described_class.call(asset: asset, all_returned: all_returned) }

  describe "when all_returned is true" do
    let(:all_returned) { true }

    it "succeeds" do
      expect(result).to be_success
    end

    it "updates the asset status to available" do
      result
      expect(asset.reload.status).to eq("available")
    end
  end

  describe "when all_returned is false" do
    let(:all_returned) { false }

    it "succeeds" do
      expect(result).to be_success
    end

    it "does not change the asset status" do
      result
      expect(asset.reload.status).to eq("assigned")
    end
  end
end
