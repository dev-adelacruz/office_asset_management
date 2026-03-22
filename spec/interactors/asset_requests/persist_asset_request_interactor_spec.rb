# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::PersistAssetRequestInteractor do
  let!(:user) { create(:user, :employee) }
  let(:valid_params) do
    {
      asset_type: "physical",
      justification: "Need a laptop.",
      urgency: "high"
    }
  end

  subject(:result) { described_class.call(asset_request_params: params, current_user: user) }

  describe "successful create" do
    let(:params) { valid_params }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates an AssetRequest record" do
      expect { result }.to change(AssetRequest, :count).by(1)
    end

    it "writes asset_request to context" do
      expect(result.asset_request).to be_a(AssetRequest)
      expect(result.asset_request).to be_persisted
    end

    it "associates the request with the correct user" do
      expect(result.asset_request.user).to eq(user)
    end

    it "writes to_status to context" do
      expect(result.to_status).to eq("pending")
    end
  end

  describe "AR validation failure" do
    let(:params) { valid_params.merge(asset_type: "invalid_type") }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "does not create an AssetRequest record" do
      expect { result }.not_to change(AssetRequest, :count)
    end
  end
end
