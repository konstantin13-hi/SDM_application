// src/components/Modal.js
export function loadModal() {
    const modal = `
    <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="settingsModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="settingsModalLabel">Settings</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <button class="btn btn-danger btn-block" id="logoutButton">Logout</button>
            <button class="btn btn-secondary btn-block" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
    document.getElementById('modal-placeholder').innerHTML = modal;
}
