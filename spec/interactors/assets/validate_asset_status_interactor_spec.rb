# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::ValidateAssetStatusInteractor do
  subject(:result) { described_class.call(asset: asset, status: status) }

  let!(:asset) { create(:asset, status: :available) }

  describe "with a valid status" do
    let(:status) { "assigned" }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "with an invalid status" do
    let(:status) { "broken" }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a descriptive message" do
      expect(result.message).to include("Invalid status")
    end
  end

  describe "with a missing status" do
    let(:status) { nil }

    it "fails the context" do
      expect(result).to be_failure
    end
  end
end
