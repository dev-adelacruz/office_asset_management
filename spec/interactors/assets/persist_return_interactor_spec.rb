# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::PersistReturnInteractor do
  let!(:log) { create(:asset_assignment_log, returned_at: nil) }

  subject(:result) { described_class.call(assignment_log: log) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "sets returned_at on the log" do
    result
    expect(log.reload.returned_at).not_to be_nil
  end

  it "does not create a new record" do
    expect { result }.not_to change(AssetAssignmentLog, :count)
  end
end
