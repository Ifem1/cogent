"""Windows-only transport compatibility for genlayer-test 0.29.2.

Windows cannot unlink the SDK's temporary stdin file while fd 0 holds it.
Defer only that unlink until VM cleanup restores stdin. Contract execution,
storage, nondeterminism, accounting and settlement remain the real SDK code.
"""
import os
import pytest


@pytest.fixture(autouse=True)
def windows_stdin_cleanup(monkeypatch):
    if os.name != 'nt':
        yield
        return
    from gltest.direct import loader
    original_inject = loader._inject_message_to_fd0
    original_unlink = os.unlink
    deferred = []

    def inject(vm):
        def unlink(path, *args, **kwargs):
            try:
                original_unlink(path, *args, **kwargs)
            except PermissionError as exc:
                if getattr(exc, 'winerror', None) != 32:
                    raise
                deferred.append(path)
        # Scope the adapter to the runner's stdin setup only.
        with monkeypatch.context() as context:
            context.setattr(os, 'unlink', unlink)
            original_inject(vm)

    monkeypatch.setattr(loader, '_inject_message_to_fd0', inject)
    yield
    for path in deferred:
        original_unlink(path)
