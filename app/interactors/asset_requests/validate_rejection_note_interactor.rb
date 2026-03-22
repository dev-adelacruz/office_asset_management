# frozen_string_literal: true

class AssetRequests::ValidateRejectionNoteInteractor
  include Interactor

  # Reads:  context.rejection_note
  # Writes: nothing (fails context if rejection_note is blank)

  def call
    context.fail!(message: "Notes is required when rejecting a request.") if context.rejection_note.blank?
  end
end
