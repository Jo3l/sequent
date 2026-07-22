import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

export interface SmbMount {
  id: number;
  path: string;
  label: string;
  type: "local" | "smb" | "webdav";
  smb_host: string;
  smb_share: string;
  smb_username: string;
  smb_password: string;
  smb_domain: string;
  active: number;
}

const MOUNT_BASE = "/mnt/sequent";

/**
 * Mount an SMB share if not already mounted.
 * Returns the local mount point path.
 */
export function mountSmbShare(mount: SmbMount): string {
  const mountPoint = resolve(MOUNT_BASE, `smb_${mount.id}`);

  if (isMounted(mountPoint)) return mountPoint;

  mkdirSync(mountPoint, { recursive: true });

  const username = mount.smb_username || "guest";
  const password = mount.smb_password || "";

  let cmd = `mount -t cifs`;
  if (mount.smb_host && mount.smb_share) {
    cmd += ` //${mount.smb_host}/${mount.smb_share}`;
  }
  cmd += ` "${mountPoint}" -o username="${username}",password="${password}"`;
  if (mount.smb_domain) cmd += `,domain=${mount.smb_domain}`;
  cmd += `,iocharset=utf8,uid=$(id -u),gid=$(id -g),file_mode=0644,dir_mode=0755`;

  try {
    execSync(cmd, { stdio: "pipe", timeout: 15_000 });
  } catch (e: any) {
    console.error("SMB mount failed:", e.stderr?.toString() || e.message);
    // Mount point exists but may not be valid; attempt cleanup
    try { execSync(`umount "${mountPoint}" 2>/dev/null`, { stdio: "pipe" }); } catch { /* ignore */ }
    throw new Error(`Failed to mount SMB share: ${mount.label}`);
  }

  return mountPoint;
}

/**
 * Unmount an SMB share.
 */
export function unmountSmbShare(mount: SmbMount): void {
  const mountPoint = resolve(MOUNT_BASE, `smb_${mount.id}`);
  if (isMounted(mountPoint)) {
    try { execSync(`umount "${mountPoint}"`, { stdio: "pipe" }); } catch { /* ignore */ }
  }
}

function isMounted(mountPoint: string): boolean {
  try {
    const out = execSync(`mountpoint -q "${mountPoint}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Test an SMB connection without persisting.
 */
export function testSmbConnection(host: string, share: string, username: string, password: string, domain: string): boolean {
  const testPoint = resolve(MOUNT_BASE, `_test_${Date.now()}`);
  try {
    mkdirSync(testPoint, { recursive: true });
    let cmd = `mount -t cifs //${host}/${share} "${testPoint}" -o username="${username}",password="${password}"`;
    if (domain) cmd += `,domain=${domain}`;
    execSync(cmd, { stdio: "pipe", timeout: 10_000 });
    execSync(`umount "${testPoint}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  } finally {
    try { execSync(`rmdir "${testPoint}" 2>/dev/null`, { stdio: "pipe" }); } catch { /* ignore */ }
  }
}
