package com.claudecode.blog.util;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class IpUtil {

    private static final String UNKNOWN = "unknown";

    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
            // X-Forwarded-For may contain multiple IPs; the first is the real client IP
            int index = ip.indexOf(',');
            if (index != -1) {
                return ip.substring(0, index).trim();
            }
            return ip.trim();
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
            return ip.trim();
        }

        ip = request.getHeader("Proxy-Client-IP");
        if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
            return ip.trim();
        }

        ip = request.getHeader("WL-Proxy-Client-IP");
        if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
            return ip.trim();
        }

        ip = request.getHeader("HTTP_CLIENT_IP");
        if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
            return ip.trim();
        }

        ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        if (ip != null && !ip.isEmpty() && !UNKNOWN.equalsIgnoreCase(ip)) {
            return ip.trim();
        }

        return request.getRemoteAddr();
    }

    public static Map<String, String> parseUserAgent(String ua) {
        Map<String, String> result = new HashMap<>();
        result.put("browser", parseBrowser(ua));
        result.put("os", parseOs(ua));
        result.put("deviceType", parseDeviceType(ua));
        return result;
    }

    private static String parseBrowser(String ua) {
        if (ua == null || ua.isEmpty()) {
            return UNKNOWN;
        }
        if (ua.contains("Edg/") || ua.contains("Edge/")) {
            return "Edge";
        }
        if (ua.contains("OPR/") || ua.contains("Opera")) {
            return "Opera";
        }
        if (ua.contains("Chrome/") && !ua.contains("Edg/")) {
            return "Chrome";
        }
        if (ua.contains("Firefox/")) {
            return "Firefox";
        }
        if (ua.contains("Safari/") && !ua.contains("Chrome/")) {
            return "Safari";
        }
        if (ua.contains("MSIE") || ua.contains("Trident/")) {
            return "IE";
        }
        return UNKNOWN;
    }

    private static String parseOs(String ua) {
        if (ua == null || ua.isEmpty()) {
            return UNKNOWN;
        }
        if (ua.contains("Windows")) {
            return "Windows";
        }
        if (ua.contains("Mac OS X")) {
            return "macOS";
        }
        if (ua.contains("Android")) {
            return "Android";
        }
        if (ua.contains("iPhone") || ua.contains("iPad") || ua.contains("iOS")) {
            return "iOS";
        }
        if (ua.contains("Linux")) {
            return "Linux";
        }
        return UNKNOWN;
    }

    private static String parseDeviceType(String ua) {
        if (ua == null || ua.isEmpty()) {
            return UNKNOWN;
        }
        if (ua.contains("Mobile") || ua.contains("Android") || ua.contains("iPhone")) {
            return "Mobile";
        }
        if (ua.contains("iPad") || ua.contains("Tablet")) {
            return "Tablet";
        }
        return "Desktop";
    }
}
