import numpy as np


def ra_dec_to_uvec(ra, dec):
    phi = np.deg2rad(90 - dec)
    theta = np.deg2rad(ra)
    x = np.cos(theta) * np.sin(phi)
    y = np.sin(theta) * np.sin(phi)
    z = np.cos(phi)
    return x, y, z


def uvec_to_ra_dec(x, y, z):
    r = np.sqrt(x**2 + y**2 + z**2)
    x /= r
    y /= r
    z /= r
    theta = np.arctan2(y, x)
    phi = np.arccos(z)
    dec = 90 - np.rad2deg(phi)
    if theta < 0:
        ra = 360 + np.rad2deg(theta)
    else:
        ra = np.rad2deg(theta)
    return ra, dec


def x_rot(theta_deg):
    theta = np.deg2rad(theta_deg)
    return np.array(
        [
            [1, 0, 0],
            [0, np.cos(theta), -np.sin(theta)],
            [0, np.sin(theta), np.cos(theta)],
        ]
    )


def y_rot(theta_deg):
    theta = np.deg2rad(theta_deg)
    return np.array(
        [
            [np.cos(theta), 0, np.sin(theta)],
            [0, 1, 0],
            [-np.sin(theta), 0, np.cos(theta)],
        ]
    )


def z_rot(theta_deg):
    theta = np.deg2rad(theta_deg)
    return np.array(
        [
            [np.cos(theta), -np.sin(theta), 0],
            [np.sin(theta), np.cos(theta), 0],
            [0, 0, 1],
        ]
    )


class Footprint:
    polygon: list = []

    def __init__(self, polygon: list) -> None:
        self.polygon = list(polygon)

    def project(self, ra, dec, pos_angle):
        if pos_angle is None:
            pos_angle = 0.0

        footprint_zero_center_ra = np.asarray([pt[0] for pt in self.polygon])
        footprint_zero_center_dec = np.asarray([pt[1] for pt in self.polygon])
        footprint_zero_center_uvec = ra_dec_to_uvec(
            footprint_zero_center_ra, footprint_zero_center_dec
        )
        (
            footprint_zero_center_x,
            footprint_zero_center_y,
            footprint_zero_center_z,
        ) = footprint_zero_center_uvec

        proj_footprint = []
        for idx in range(footprint_zero_center_x.shape[0]):
            vec = np.asarray(
                [
                    footprint_zero_center_x[idx],
                    footprint_zero_center_y[idx],
                    footprint_zero_center_z[idx],
                ]
            )
            new_vec = vec @ x_rot(-pos_angle) @ y_rot(dec) @ z_rot(-ra)
            new_x, new_y, new_z = new_vec.flat
            pt_ra, pt_dec = uvec_to_ra_dec(new_x, new_y, new_z)
            proj_footprint.append([round(pt_ra, 3), round(pt_dec, 3)])

        return proj_footprint
