iptables -A INPUT -i ens3 -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -i ens3 -p tcp --dport 8080 -j ACCEPT
iptables -A PREROUTING -t nat -i ens3 -p tcp --dport 80 -j REDIRECT --to-port 30001