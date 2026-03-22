# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::ValidateAssetRequestParamsInteractor do
  let(:valid_params) do
    {
      asset_type: "physical",
      justification: "Need a laptop for remote work.",
      urgency: "high"
    }
  end

  subject(:result) { described_class.call(asset_request_params: params) }

  describe "valid params" do
    let(:params) { valid_params }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "missing asset_type" do
    let(:params) { valid_params.merge(asset_type: nil) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a relevant message" do
      expect(result.message).to include("Asset type")
    end
  end

  describe "missing justification" do
    let(:params) { valid_params.merge(justification: nil) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a relevant message" do
      expect(result.message).to include("Justification")
    end
  end

  describe "invalid urgency" do
    let(:params) { valid_params.merge(urgency: "critical") }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a relevant message" do
      expect(result.message).to include("Urgency")
    end
  end
end
