package com.claudecode.blog.interceptor;

import com.claudecode.blog.entity.VisitLog;
import com.claudecode.blog.mapper.VisitLogMapper;
import com.claudecode.blog.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class VisitLogInterceptor implements HandlerInterceptor {

    private static final Pattern ARTICLE_URL_PATTERN = Pattern.compile("/article/(\\d+)");

    private final VisitLogMapper visitLogMapper;

    public VisitLogInterceptor(VisitLogMapper visitLogMapper) {
        this.visitLogMapper = visitLogMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        try {
            String ip = IpUtil.getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            String referer = request.getHeader("Referer");
            String pageUrl = request.getRequestURI();
            String sessionId = request.getSession(true).getId();

            Map<String, String> deviceInfo = IpUtil.parseUserAgent(userAgent);

            Long articleId = null;
            Matcher matcher = ARTICLE_URL_PATTERN.matcher(pageUrl);
            if (matcher.find()) {
                articleId = Long.parseLong(matcher.group(1));
            }

            VisitLog visitLog = new VisitLog();
            visitLog.setVisitorIp(ip);
            visitLog.setVisitorUa(userAgent);
            visitLog.setVisitorReferer(referer);
            visitLog.setPageUrl(pageUrl);
            visitLog.setSessionId(sessionId);
            visitLog.setArticleId(articleId);
            visitLog.setBrowser(deviceInfo.get("browser"));
            visitLog.setOs(deviceInfo.get("os"));
            visitLog.setDeviceType(deviceInfo.get("deviceType"));
            visitLog.setCreatedAt(LocalDateTime.now());

            visitLogMapper.insert(visitLog);
        } catch (Exception e) {
            // Silently ignore visit log errors to not affect the main request
        }

        return true;
    }
}
